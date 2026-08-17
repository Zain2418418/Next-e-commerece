import { NextResponse } from "next/server";
import { getStoreCatalogContext } from "@/lib/aiKnowledge";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "Gemini API key is not configured on the server." },
        { status: 500 }
      );
    }

    const { message, chatHistory } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "A valid prompt string is required." },
        { status: 400 }
      );
    }

    const baseContext = getStoreCatalogContext();
    const systemContext = `${baseContext}

CRITICAL OUTPUT RULE:
You are an AI Shopping Assistant directly chatting with a customer.
Output ONLY the final conversational message intended for the customer.
DO NOT output any bullet points analyzing user requests, catalog checks, verification steps, or checklists like "Polite? Yes".
NEVER show internal thinking.`;

    let formattedHistory = Array.isArray(chatHistory)
      ? chatHistory.map((msg: { sender: string; text: string }) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }))
      : [];

    while (formattedHistory.length > 0 && formattedHistory[0].role === "model") {
      formattedHistory.shift();
    }

    const contents = [
      ...formattedHistory,
      { role: "user", parts: [{ text: message }] }
    ];

    const modelsResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    let targetModel = "models/gemini-2.0-flash";

    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json();
      const availableModels = modelsData.models?.filter((m: any) =>
        m.supportedGenerationMethods?.includes("generateContent") &&
        !m.name.includes("2.5")
      );

      const preferred = availableModels?.find((m: any) => m.name.includes("gemini-2.0-flash")) || availableModels?.[0];
      
      if (preferred?.name) {
        targetModel = preferred.name;
      }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemContext }]
          },
          contents,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.1,
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to fetch response from Gemini API.");
    }

    const rawResponse: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 🎯 Foolproof extraction logic for thought removal:
    let cleanReply = rawResponse;

    // 1. Agar quotes ("...") ke andar real response mojud hai to usy nikal lein
    const doubleQuoteMatch = cleanReply.match(/"([^"]{15,})"/);
    if (doubleQuoteMatch && doubleQuoteMatch[1]) {
      cleanReply = doubleQuoteMatch[1];
    } else {
      // 2. Aksar AI thinking ke baad aakhir mein real response deta hai, isliye lines filter kar lein
      const lines = cleanReply.split("\n");
      const validLines = lines.filter((line) => {
        const t = line.trim();
        if (!t) return false;
        if (t.startsWith("*") || t.startsWith("-")) {
          if (
            t.includes("User wants:") ||
            t.includes("Catalog check:") ||
            t.includes("Role:") ||
            t.includes("Tone:") ||
            t.includes("Constraint:") ||
            t.includes("Polite?") ||
            t.includes("Helpful?") ||
            t.includes("Concise?") ||
            t.includes("Accurate?") ||
            t.includes("Matches requirements?") ||
            t.includes("Includes IDs") ||
            t.includes("No internal")
          ) {
            return false;
          }
        }
        return true;
      });

      cleanReply = validLines.join("\n").trim();
    }

    return NextResponse.json({
      success: true,
      reply: cleanReply || rawResponse,
    });

  } catch (error: any) {
    console.error("Gemini AI API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to generate AI response.",
      },
      { status: 500 }
    );
  }
}
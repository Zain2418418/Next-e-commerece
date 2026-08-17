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

You are an AI Shopping Assistant directly chatting with a customer.
Provide ONLY your helpful response to the customer. 
Do NOT show any internal reasoning, thoughts, or evaluation checklists.`;

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
            temperature: 0.3,
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to fetch response from Gemini API.");
    }

    const rawResponse: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 🎯 FIX: Clean response extraction without echoing user query
    let cleanReply = rawResponse;

    // 1. Agar XML thought tags hain to unhe remove karein
    cleanReply = cleanReply.replace(/<thought>[\s\S]*?<\/thought>/gi, "").trim();

    // 2. Clear out bullet-point reasoning blocks line by line
    const lines = cleanReply.split("\n");
    const filteredLines = lines.filter((line) => {
      const t = line.trim();
      if (!t) return true; // Keep spacing
      return (
        !t.startsWith("* User wants:") &&
        !t.startsWith("* Catalog check:") &&
        !t.startsWith("* Role:") &&
        !t.startsWith("* Tone:") &&
        !t.startsWith("* Constraint:") &&
        !t.startsWith("* Polite") &&
        !t.startsWith("* Helpful") &&
        !t.startsWith("* Concise") &&
        !t.startsWith("* Accurate") &&
        !t.startsWith("* Matches") &&
        !t.startsWith("* Includes") &&
        !t.startsWith("* No internal")
      );
    });

    cleanReply = filteredLines.join("\n").trim();

    // 3. Fallback agar clean reply empty ho jaye
    if (!cleanReply && rawResponse) {
      cleanReply = rawResponse.trim();
    }

    return NextResponse.json({
      success: true,
      reply: cleanReply,
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
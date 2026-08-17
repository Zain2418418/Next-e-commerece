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

CRITICAL SYSTEM DIRECTIVE:
- You are a direct text assistant. DO NOT show any thinking, catalog checks, step-by-step verification, bullet points of internal reasoning, or thought processes.
- Respond ONLY with the final message intended for the customer.
- Never output "User wants:", "Catalog check:", "Role:", "Constraint:", or validation checklists.`;

    // Format chat history
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

    // Fetch dynamic model
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
            temperature: 0.2,
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to fetch response from Gemini API.");
    }

    let rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 🧹 Thorough regex stripper for all internal thought patterns
    let cleanReply = rawResponse;

    // 1. Remove XML thought blocks
    cleanReply = cleanReply.replace(/<thought>[\s\S]*?<\/thought>/gi, "");

    // 2. Remove internal planning blocks (e.g. "* User wants: ... * Polite/Helpful? Yes.")
    cleanReply = cleanReply.replace(/(?:\*|\-)\s*(?:User wants|Catalog check|Role|Tone|Constraint|Polite|Strictly|Includes|No invented|No internal)[\s\S]*?(?=\n\n[A-Z0-9"']|\n[A-Z0-9"']|$)/gi, "");

    // 3. Fallback strip if quoted response exists at the end
    const quoteMatch = cleanReply.match(/"([^"]+)"/);
    if (cleanReply.includes("User wants:") && quoteMatch && quoteMatch[1]) {
      cleanReply = quoteMatch[1];
    }

    cleanReply = cleanReply.trim();

    // Final fallback
    if (!cleanReply && rawResponse) {
      cleanReply = rawResponse;
    }

    return NextResponse.json({
      success: true,
      reply: cleanReply || "I couldn't fetch a reply. Please try again.",
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
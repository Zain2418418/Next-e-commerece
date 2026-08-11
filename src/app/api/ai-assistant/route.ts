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

    // Strict formatting rule appended to context
    const baseContext = getStoreCatalogContext();
    const systemContext = `${baseContext}

CRITICAL OUTPUT RULE:
- Do NOT output your internal thinking, reasoning process, analysis, or scratchpad steps.
- Do NOT use bullet points analyzing user request or constraints.
- Output ONLY the final direct, polite response meant for the customer.`;

    // Clean and format history
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

    // Fetch available models dynamically
    const modelsResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    let targetModel = "models/gemini-2.0-flash"; // fallback

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

    let responseText: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    // Remove internal thinking blocks if present
    if (responseText.includes("*   User") || responseText.includes("*   Constraint")) {
      const lines = responseText.split("\n");
      const cleanLines = lines.filter(
        (line: string) =>
          !line.trim().startsWith("*   User") &&
          !line.trim().startsWith("*   Constraint") &&
          !line.trim().startsWith("*   Greeting:") &&
          !line.trim().startsWith("*   Recommendations:") &&
          !line.trim().startsWith("*   Closing:") &&
          !line.trim().startsWith("*   Polite/") &&
          !line.trim().startsWith("*   Strictly") &&
          !line.trim().startsWith("*   Include") &&
          !line.trim().startsWith("*   No invented")
      );
      responseText = cleanLines.join("\n").trim();
    }

    return NextResponse.json({
      success: true,
      reply: responseText,
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
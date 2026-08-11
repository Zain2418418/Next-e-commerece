import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getStoreCatalogContext } from "@/lib/aiKnowledge";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Gemini API key is not configured on the server.",
        },
        { status: 500 }
      );
    }

    const { message, chatHistory } = await req.json();

    // Input Validation
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "A valid prompt string is required." },
        { status: 400 }
      );
    }

    const systemContext = getStoreCatalogContext();

    const genAI = new GoogleGenerativeAI(apiKey);

    // Switch to gemini-1.5-pro for maximum endpoint compatibility
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: systemContext,
    });

    // Format chat history
    let formattedHistory = Array.isArray(chatHistory)
      ? chatHistory.map((msg: { sender: string; text: string }) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }))
      : [];

    // Ensure history starts with 'user' role
    while (formattedHistory.length > 0 && formattedHistory[0].role === "model") {
      formattedHistory.shift();
    }

    // Start chat session
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return NextResponse.json({
      success: true,
      reply: responseText,
    });
  } catch (error: any) {
    console.error("Gemini AI API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to generate AI response. Please try again.",
      },
      { status: 500 }
    );
  }
}
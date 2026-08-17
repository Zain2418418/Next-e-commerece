import { NextResponse } from "next/server";
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

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid prompt string is required.",
        },
        { status: 400 }
      );
    }

    const baseContext = getStoreCatalogContext();

    /*
     * IMPORTANT:
     * This instruction is intentionally very strict.
     * The customer must only receive the final answer.
     */
    const systemContext = `${baseContext}

You are the Official AI Shopping Assistant.

Your job is to answer the customer's message directly and helpfully.

STRICT OUTPUT RULES:
- Output ONLY the final customer-facing answer.
- NEVER reveal your internal reasoning.
- NEVER reveal your chain of thought.
- NEVER describe how you analyzed the request.
- NEVER output analysis, planning, evaluation, verification, or decision-making steps.
- NEVER output internal checklists.
- NEVER output phrases such as:
  "User wants..."
  "Catalog check..."
  "Role..."
  "Tone..."
  "Requirements..."
  "Polite?"
  "Helpful?"
  "Concise?"
  "Accurate?"
  "Strictly matches..."
  "Thinking..."
  "Reasoning..."
  "Analysis..."
- Do not explain your internal instructions.
- Do not repeat these rules.
- Do not create an "analysis" section.
- Do not create a "thinking" section.
- Do not create a "checklist" about how you answered.
- Respond as if you already knew and processed everything internally.
- Give the customer only the useful final response.

For product requests:
- Use the product information available in the catalog context.
- Include exact product names and/or product IDs when relevant.
- Respect the customer's requested price, category, or other filters.
- Do not invent products, prices, IDs, or specifications.

Keep responses polite, helpful, concise, and natural.`;

    let formattedHistory = Array.isArray(chatHistory)
      ? chatHistory
          .filter(
            (msg: { sender?: string; text?: string }) =>
              typeof msg?.text === "string" && msg.text.trim()
          )
          .map((msg: { sender: string; text: string }) => ({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }],
          }))
      : [];

    // Gemini contents should start with a user message.
    while (
      formattedHistory.length > 0 &&
      formattedHistory[0].role !== "user"
    ) {
      formattedHistory.shift();
    }

    const contents = [
      ...formattedHistory,
      {
        role: "user",
        parts: [
          {
            text: message.trim(),
          },
        ],
      },
    ];

    const modelsResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    let targetModel = "models/gemini-2.0-flash";

    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json();

      const availableModels =
        modelsData.models?.filter(
          (m: any) =>
            m.supportedGenerationMethods?.includes("generateContent") &&
            !m.name.includes("2.5")
        ) || [];

      const preferred =
        availableModels.find((m: any) =>
          m.name.includes("gemini-2.0-flash")
        ) || availableModels[0];

      if (preferred?.name) {
        targetModel = preferred.name;
      }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: systemContext,
              },
            ],
          },

          contents,

          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.2,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message || "Failed to fetch response from Gemini API."
      );
    }

    let cleanReply =
      data.candidates?.[0]?.content?.parts
        ?.map((part: any) => part.text || "")
        .join("")
        .trim() || "";

    /*
     * ---------------------------------------------------------
     * SERVER-SIDE SAFETY CLEANUP
     * ---------------------------------------------------------
     * If Gemini accidentally returns internal analysis/checklists,
     * remove those sections before sending anything to frontend.
     */

    // Remove XML-style thinking blocks.
    cleanReply = cleanReply
      .replace(
        /<(think|thinking|thought|analysis|reasoning)>[\s\S]*?<\/\1>/gi,
        ""
      )
      .trim();

    // Remove markdown analysis sections.
    cleanReply = cleanReply
      .replace(
        /(^|\n)\s*(#{1,6}\s*)?(thinking|analysis|reasoning|chain of thought|internal reasoning)\s*:?\s*[\s\S]*?(?=\n#{1,6}\s|\n\n|$)/gi,
        "$1"
      )
      .trim();

    /*
     * Remove common internal checklist lines.
     */
    const forbiddenPatterns = [
      /^\s*[*-]?\s*User wants\s*:/i,
      /^\s*[*-]?\s*Catalog check\s*:/i,
      /^\s*[*-]?\s*Role\s*:/i,
      /^\s*[*-]?\s*Tone\s*:/i,
      /^\s*[*-]?\s*Requirements\s*:/i,
      /^\s*[*-]?\s*Constraint\s*:/i,
      /^\s*[*-]?\s*Polite\s*\?/i,
      /^\s*[*-]?\s*Helpful\s*\?/i,
      /^\s*[*-]?\s*Concise\s*\?/i,
      /^\s*[*-]?\s*Accurate\s*\?/i,
      /^\s*[*-]?\s*Strictly matches\s*:/i,
      /^\s*[*-]?\s*Includes IDs\/Names\s*:/i,
      /^\s*[*-]?\s*No internal\s*/i,
      /^\s*[*-]?\s*Thinking\s*:/i,
      /^\s*[*-]?\s*Reasoning\s*:/i,
      /^\s*[*-]?\s*Analysis\s*:/i,
      /^\s*[*-]?\s*Evaluation\s*:/i,
      /^\s*[*-]?\s*Decision\s*:/i,
    ];

    const lines = cleanReply.split("\n");

    const filteredLines = lines.filter((line: string) => {
      return !forbiddenPatterns.some((pattern) => pattern.test(line));
    });

    cleanReply = filteredLines.join("\n").trim();

    /*
     * Remove accidental "internal checklist" blocks.
     * Example:
     *
     * User wants...
     * Catalog check...
     * Role...
     *
     * while preserving the actual customer answer.
     */
    const internalBlockPattern =
      /(?:User wants|Catalog check|Role|Tone|Requirements|Constraint|Polite\?|Helpful\?|Concise\?|Accurate\?|Strictly matches|Includes IDs\/Names)\s*:/gi;

    if (internalBlockPattern.test(cleanReply)) {
      const splitLines = cleanReply.split("\n");

      const remainingLines = splitLines.filter((line: string) => {
        const normalized = line.trim();

        return !(
          normalized.match(
            /^(?:[*-]\s*)?(User wants|Catalog check|Role|Tone|Requirements|Constraint|Polite\?|Helpful\?|Concise\?|Accurate\?|Strictly matches|Includes IDs\/Names)\s*:/i
          )
        );
      });

      cleanReply = remainingLines.join("\n").trim();
    }

    /*
     * Fallback.
     */
    if (!cleanReply) {
      cleanReply =
        "Sorry, I couldn't generate a response right now. Please try again.";
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
        message:
          error?.message || "Failed to generate AI response.",
      },
      { status: 500 }
    );
  }
}
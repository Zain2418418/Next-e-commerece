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

    // Store/catalog information
    const baseContext = getStoreCatalogContext();

    // Strict instructions: only customer-facing response
    const systemContext = `${baseContext}

You are the Official AI Shopping Assistant for an e-commerce store.

IMPORTANT:
Your response will be displayed directly to the customer.

You MUST output ONLY the final customer-facing answer.

NEVER output:
- Internal reasoning
- Chain of thought
- Analysis
- Thinking
- Planning
- Evaluation
- Decision making
- Internal checklists
- Verification steps
- "User wants..."
- "Catalog check..."
- "Role..."
- "Tone..."
- "Requirements..."
- "Constraint..."
- "Polite?"
- "Helpful?"
- "Concise?"
- "Accurate?"
- "Strictly matches..."
- "Includes IDs/Names..."
- "Direct answer..."
- Any explanation of how you generated the answer

Do not show your work.

Do not describe what the user requested before answering.

Do not describe how you checked the catalog.

Do not create an analysis section.

Do not create a thinking section.

Do not create a checklist.

Simply answer the customer's message naturally.

For product recommendations:
- Only recommend products that exist in the provided catalog.
- Use exact product names, IDs, and prices from the catalog.
- Never invent products or product information.
- Follow the customer's filters such as price, category, or requirements.
- Keep the response polite, helpful, concise, and natural.

The final output must be ready to display directly inside a customer chat UI.`;

    /*
     * IMPORTANT:
     * We intentionally do NOT send previous AI responses during testing.
     *
     * This prevents an old response containing "User wants...",
     * "Catalog check...", etc. from being learned/copied by Gemini.
     *
     * Once everything is working correctly, chat history can be
     * safely added back if needed.
     */
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: message.trim(),
          },
        ],
      },
    ];

    /*
     * Use one fixed model instead of dynamically selecting a model.
     */
    const targetModel = "models/gemini-2.0-flash";

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
        data.error?.message ||
          "Failed to fetch response from Gemini API."
      );
    }

    /*
     * Extract only normal text parts.
     *
     * Gemini can return parts with thought=true.
     * Those parts must NEVER be sent to the customer.
     */
    const parts = data.candidates?.[0]?.content?.parts || [];

    let cleanReply = parts
      .filter(
        (part: any) =>
          part &&
          typeof part.text === "string" &&
          part.thought !== true
      )
      .map((part: any) => part.text)
      .join("")
      .trim();

    /*
     * Additional safety cleanup.
     *
     * If Gemini accidentally generates internal checklist text,
     * remove those lines before returning the response.
     */
    const forbiddenLinePatterns = [
      /^\s*[*•-]?\s*User wants\s*:/i,
      /^\s*[*•-]?\s*Catalog check\s*:/i,
      /^\s*[*•-]?\s*Role\s*:/i,
      /^\s*[*•-]?\s*Tone\s*:/i,
      /^\s*[*•-]?\s*Requirements\s*:/i,
      /^\s*[*•-]?\s*Constraint\s*:/i,
      /^\s*[*•-]?\s*Polite\s*\?/i,
      /^\s*[*•-]?\s*Helpful\s*\?/i,
      /^\s*[*•-]?\s*Concise\s*\?/i,
      /^\s*[*•-]?\s*Accurate\s*\?/i,
      /^\s*[*•-]?\s*Strictly matches\s*:/i,
      /^\s*[*•-]?\s*Includes IDs\/Names\s*:/i,
      /^\s*[*•-]?\s*No internal\s*/i,
      /^\s*[*•-]?\s*Thinking\s*:/i,
      /^\s*[*•-]?\s*Reasoning\s*:/i,
      /^\s*[*•-]?\s*Analysis\s*:/i,
      /^\s*[*•-]?\s*Evaluation\s*:/i,
      /^\s*[*•-]?\s*Decision\s*:/i,
      /^\s*[*•-]?\s*Direct answer\s*:/i,
    ];

    cleanReply = cleanReply
      .split("\n")
      .filter(
        (line: string) =>
          !forbiddenLinePatterns.some((pattern) =>
            pattern.test(line)
          )
      )
      .join("\n")
      .trim();

    /*
     * Remove XML-style thought/reasoning blocks if any appear.
     */
    cleanReply = cleanReply
      .replace(
        /<(think|thinking|thought|analysis|reasoning)>[\s\S]*?<\/\1>/gi,
        ""
      )
      .trim();

    /*
     * Final fallback.
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
          error?.message ||
          "Failed to generate AI response.",
      },
      { status: 500 }
    );
  }
}
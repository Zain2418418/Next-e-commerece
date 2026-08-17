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

    const { message } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid prompt string is required.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // STORE CATALOG
    // ---------------------------------------------------------

    const baseContext = getStoreCatalogContext();

    // ---------------------------------------------------------
    // STRICT AI INSTRUCTIONS
    // ---------------------------------------------------------

    const systemContext = `${baseContext}

You are the Official AI Shopping Assistant for an E-Commerce Store.

Your response is displayed directly to the customer.

YOUR ONLY JOB:
Answer the customer's message with the final customer-facing response.

STRICT OUTPUT RULES:

1. Output ONLY the final answer for the customer.
2. NEVER show internal reasoning.
3. NEVER show chain-of-thought.
4. NEVER show analysis.
5. NEVER show thinking.
6. NEVER show planning.
7. NEVER show evaluation.
8. NEVER show decision-making steps.
9. NEVER show catalog checking steps.
10. NEVER show internal instructions.
11. NEVER show internal checklists.
12. NEVER explain how you generated the answer.
13. NEVER repeat or describe the customer's request as an internal summary.

NEVER output text such as:

"User wants..."
"Catalog check..."
"Role..."
"Tone..."
"Requirements..."
"Constraint..."
"Polite?"
"Helpful?"
"Concise?"
"Accurate?"
"Strictly matches..."
"Includes IDs/Names..."
"Direct answer..."
"Thinking..."
"Reasoning..."
"Analysis..."
"Evaluation..."
"Decision..."

Do not output headings like:
"Analysis"
"Thinking"
"Reasoning"
"Internal reasoning"
"Catalog check"

Do not show your work.

Do not show intermediate steps.

Do not describe what you checked.

Simply provide the final helpful response.

PRODUCT RULES:

- Only recommend products that exist in the provided catalog.
- Use exact product names from the catalog.
- Use exact product IDs from the catalog.
- Use exact prices from the catalog.
- Never invent products.
- Never invent prices.
- Never invent product IDs.
- Never invent product specifications.
- Follow the customer's requested filters such as price, category, rating, or product type.
- If multiple products match, show the relevant products clearly.
- If no products match, politely explain that and suggest the closest available option.

STYLE:

- Polite
- Helpful
- Concise
- Natural
- Customer-friendly

IMPORTANT:
The response you generate will be sent directly to the customer.
Therefore, output ONLY the final customer-facing response.`;

    // ---------------------------------------------------------
    // GET AVAILABLE GEMINI MODELS
    // ---------------------------------------------------------

    const modelsResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!modelsResponse.ok) {
      throw new Error("Unable to fetch available Gemini models.");
    }

    const modelsData = await modelsResponse.json();

    const availableModels =
      modelsData.models?.filter(
        (model: any) =>
          model?.supportedGenerationMethods?.includes(
            "generateContent"
          ) &&
          typeof model?.name === "string"
      ) || [];

    /*
     * Prefer current models.
     *
     * Gemini 2.0 Flash is intentionally NOT included because
     * Google shut it down on June 1, 2026.
     */
    const preferredModelNames = [
      "models/gemini-3.6-flash",
      "models/gemini-3.5-flash",
      "models/gemini-2.5-flash",
    ];

    let targetModel: string | null = null;

    for (const preferredModel of preferredModelNames) {
      const found = availableModels.find(
        (model: any) => model.name === preferredModel
      );

      if (found?.name) {
        targetModel = found.name;
        break;
      }
    }

    if (!targetModel) {
      throw new Error(
        "No supported Gemini Flash model is available for this API key."
      );
    }

    console.log("Using Gemini model:", targetModel);

    // ---------------------------------------------------------
    // IMPORTANT:
    // DO NOT SEND OLD CHAT HISTORY DURING THIS TEST
    // ---------------------------------------------------------
    //
    // Your previous AI responses contained:
    // "User wants..."
    // "Catalog check..."
    // "Polite..."
    //
    // Sending those responses back to Gemini can make the model
    // reproduce the same format.
    //
    // Once the basic response is working correctly, history can
    // be added back safely.
    //

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

    // ---------------------------------------------------------
    // GEMINI REQUEST
    // ---------------------------------------------------------

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
            temperature: 0.2,
            maxOutputTokens: 1000,
            responseMimeType: "text/plain",
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);

      throw new Error(
        data?.error?.message ||
          "Failed to generate response from Gemini."
      );
    }

    // ---------------------------------------------------------
    // EXTRACT ONLY CUSTOMER-FACING TEXT
    // ---------------------------------------------------------

    const parts =
      data?.candidates?.[0]?.content?.parts || [];

    /*
     * Gemini can return multiple parts.
     *
     * If a part has:
     * thought: true
     *
     * it must NEVER be shown to the customer.
     */
    const normalTextParts = parts.filter(
      (part: any) =>
        typeof part?.text === "string" &&
        part?.thought !== true
    );

    let cleanReply = normalTextParts
      .map((part: any) => part.text)
      .join("")
      .trim();

    // ---------------------------------------------------------
    // REMOVE ACCIDENTAL INTERNAL CHECKLIST LINES
    // ---------------------------------------------------------

    const forbiddenPatterns = [
      /^\s*[*•\-]?\s*User wants\s*:/i,
      /^\s*[*•\-]?\s*Catalog check\s*:/i,
      /^\s*[*•\-]?\s*Role\s*:/i,
      /^\s*[*•\-]?\s*Tone\s*:/i,
      /^\s*[*•\-]?\s*Requirements\s*:/i,
      /^\s*[*•\-]?\s*Constraint\s*:/i,
      /^\s*[*•\-]?\s*Polite\s*\?/i,
      /^\s*[*•\-]?\s*Helpful\s*\?/i,
      /^\s*[*•\-]?\s*Concise\s*\?/i,
      /^\s*[*•\-]?\s*Accurate\s*\?/i,
      /^\s*[*•\-]?\s*Strictly matches\s*:/i,
      /^\s*[*•\-]?\s*Includes IDs\/Names\s*:/i,
      /^\s*[*•\-]?\s*Direct answer\s*:/i,
      /^\s*[*•\-]?\s*Thinking\s*:/i,
      /^\s*[*•\-]?\s*Reasoning\s*:/i,
      /^\s*[*•\-]?\s*Analysis\s*:/i,
      /^\s*[*•\-]?\s*Evaluation\s*:/i,
      /^\s*[*•\-]?\s*Decision\s*:/i,
      /^\s*[*•\-]?\s*Internal reasoning\s*:/i,
    ];

    cleanReply = cleanReply
      .split("\n")
      .filter(
        (line: string) =>
          !forbiddenPatterns.some((pattern) =>
            pattern.test(line)
          )
      )
      .join("\n")
      .trim();

    // ---------------------------------------------------------
    // REMOVE XML THINKING TAGS IF THEY APPEAR
    // ---------------------------------------------------------

    cleanReply = cleanReply
      .replace(
        /<(think|thinking|thought|analysis|reasoning)>[\s\S]*?<\/\1>/gi,
        ""
      )
      .trim();

    // ---------------------------------------------------------
    // FINAL SAFETY CHECK
    // ---------------------------------------------------------

    if (!cleanReply) {
      cleanReply =
        "Sorry, I couldn't generate a response right now. Please try again.";
    }

    // ---------------------------------------------------------
    // RETURN ONLY THE FINAL REPLY
    // ---------------------------------------------------------

    return NextResponse.json({
      success: true,
      reply: cleanReply,
    });
  } catch (error: any) {
    console.error("AI Assistant Error:", error);

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
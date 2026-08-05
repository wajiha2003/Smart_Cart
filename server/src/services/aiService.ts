import OpenAI from "openai";
import { ApiError } from "../middleware/errorHandler";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CatalogueItem {
  id: string;
  title: string;
  category: string;
  price: number;
}

export interface RecommendationResult {
  productId: string;
  reason: string;
}

export async function generateProduct(title: string, category: string) {
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are an ecommerce copywriter. Always return valid JSON only, with no markdown formatting, no code fences, and no extra text before or after the JSON.",
        },
        {
          role: "user",
          content: `
Generate a product description.

Title:
${title}

Category:
${category}

Return ONLY this JSON:

{
  "description": "",
  "highlights": ["", "", "", ""]
}
          `,
        },
      ],
    });

    const raw = completion.choices[0].message.content!;
    const clean = raw.replace(/```json|```/g, "").trim();

    return JSON.parse(clean);
  } catch (err: any) {
    console.error("Groq generation error:", err?.message || err);
    throw new ApiError(502, "AI generation failed. Please try again.");
  }
}

// ---------------------------------------------------------------------------
// AI product recommendations
// ---------------------------------------------------------------------------
export async function getRecommendations(
  orderHistory: string[],   // titles of previously ordered products
  cartItems: string[],      // titles of products currently in cart
  catalogue: CatalogueItem[]
): Promise<RecommendationResult[]> {
  try {
    // Keep the catalogue concise so it fits in the context window
    const catalogueSummary = catalogue
      .map((p) => `- id:${p.id} | "${p.title}" | ${p.category} | $${p.price.toFixed(2)}`)
      .join("\n");

    const historyText =
      orderHistory.length > 0
        ? orderHistory.join(", ")
        : "No previous orders yet";

    const cartText =
      cartItems.length > 0
        ? cartItems.join(", ")
        : "Cart is empty";

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a smart eCommerce recommendation engine. You suggest products based on user behaviour. Always return valid JSON only — no markdown, no code fences, no extra text.",
        },
        {
          role: "user",
          content: `
You are helping a customer on SmartCart find products they'll love.

Order history (previously purchased): ${historyText}
Current cart: ${cartText}

Available products catalogue:
${catalogueSummary}

Task:
- Pick the 3 most relevant products from the catalogue above to recommend.
- Do NOT recommend products already in the cart.
- Base your picks on the order history and cart context.
- If there is no history, pick 3 popular-sounding products.

Return ONLY this JSON (array of exactly 3 items):
[
  { "productId": "<id from catalogue>", "reason": "<one short sentence why>" },
  { "productId": "<id from catalogue>", "reason": "<one short sentence why>" },
  { "productId": "<id from catalogue>", "reason": "<one short sentence why>" }
]
          `.trim(),
        },
      ],
    });

    const raw = completion.choices[0].message.content!;
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed)) throw new Error("Expected an array");

    return parsed as RecommendationResult[];
  } catch (err: any) {
    console.error("Groq recommendations error:", err?.message || err);
    throw new ApiError(502, "AI recommendations failed. Please try again.");
  }
}

// ---------------------------------------------------------------------------
// Shopping assistant chatbot
// ---------------------------------------------------------------------------
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  /** Product IDs the LLM explicitly tagged with [[PRODUCT:id]] */
  mentionedProductIds: string[];
}

export async function chatWithAssistant(
  messages: ChatMessage[],
  catalogue: CatalogueItem[]
): Promise<ChatResponse> {
  try {
    const catalogueText = catalogue
      .map(
        (p) =>
          `- [[PRODUCT:${p.id}]] "${p.title}" | ${p.category} | $${p.price.toFixed(2)}`
      )
      .join("\n");

    const systemPrompt = `
You are SmartCart's friendly AI shopping assistant. Your job is to chat with customers, understand what they need, and recommend specific products from the catalogue below.

Rules:
1. Be conversational, warm, and concise.
2. Ask clarifying questions when needed (budget, use case, preferences).
3. When recommending a product, ALWAYS reference it using its exact tag format: [[PRODUCT:id]]
   Example: "I'd suggest the [[PRODUCT:abc123]] — it's great value for home office use."
4. Only recommend products that exist in the catalogue below.
5. Recommend at most 3 products per reply.
6. If the customer asks something unrelated to shopping, politely redirect them.

Available products catalogue:
${catalogueText}
    `.trim();

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });

    const reply = completion.choices[0].message.content ?? "";

    // Extract all [[PRODUCT:id]] tags from the reply
    const mentionedProductIds = [...reply.matchAll(/\[\[PRODUCT:([^\]]+)\]\]/g)].map(
      (m) => m[1]
    );

    return { reply, mentionedProductIds };
  } catch (err: any) {
    console.error("Groq chat error:", err?.message || err);
    throw new ApiError(502, "Chat assistant failed. Please try again.");
  }
}

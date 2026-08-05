import { Request, Response, NextFunction } from "express";
import { ApiError } from "../middleware/errorHandler";
import {
  generateProduct,
  getRecommendations,
  chatWithAssistant,
  CatalogueItem,
  ChatMessage,
} from "../services/aiService";
import { AuthRequest } from "../middleware/auth";
import Order from "../models/Order";
import Cart from "../models/Cart";
import Product from "../models/Product";

export async function generateProductContent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { title, category } = req.body;

    if (!title || !category) {
      throw new ApiError(400, "title and category are required");
    }

    const result = await generateProduct(title, category);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function recommendations(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;

    // Fetch user context in parallel
    const [orders, cart, allProducts] = await Promise.all([
      Order.find({ userId }).sort({ createdAt: -1 }).limit(10),
      Cart.findOne({ userId }),
      Product.find({ stock: { $gt: 0 } }),
    ]);

    // Flatten previously ordered product titles
    const orderHistory = orders.flatMap((o) => o.items.map((i) => i.title));

    // Current cart product titles (to exclude from recommendations)
    const cartTitles = (cart?.items ?? []).map((i: any) => {
      // cart items store productId ref; title may not be denormalized — use id to match
      const matched = allProducts.find(
        (p) => p._id.toString() === i.productId?.toString()
      );
      return matched?.title ?? "";
    });

    // Cart product IDs so we can filter them out of the catalogue
    const cartProductIds = new Set(
      (cart?.items ?? []).map((i: any) => i.productId?.toString())
    );

    const catalogue: CatalogueItem[] = allProducts
      .filter((p) => !cartProductIds.has(p._id.toString()))
      .map((p) => ({
        id: p._id.toString(),
        title: p.title,
        category: p.category,
        price: p.price,
      }));

    if (catalogue.length === 0) {
      return res.json({ recommendations: [] });
    }

    const raw = await getRecommendations(orderHistory, cartTitles, catalogue);

    // Resolve product IDs returned by the LLM to full product documents
    const resolved = await Promise.all(
      raw.map(async ({ productId, reason }) => {
        const product = await Product.findById(productId).catch(() => null);
        if (!product) return null;
        return { product, reason };
      })
    );

    const recommendations = resolved.filter(Boolean);

    res.json({ recommendations });
  } catch (err) {
    next(err);
  }
}

export async function chat(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { messages } = req.body as { messages: ChatMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new ApiError(400, "messages array is required");
    }

    // Only keep the last 20 turns to stay within context limits
    const history = messages.slice(-20);

    // Load in-stock catalogue
    const allProducts = await Product.find({ stock: { $gt: 0 } });

    const catalogue: CatalogueItem[] = allProducts.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      category: p.category,
      price: p.price,
    }));

    const { reply, mentionedProductIds } = await chatWithAssistant(history, catalogue);

    // Resolve mentioned product IDs to full documents
    const products = await Promise.all(
      mentionedProductIds.map((id) =>
        Product.findById(id).catch(() => null)
      )
    ).then((results) => results.filter(Boolean));

    // Strip [[PRODUCT:id]] tags from the reply text before sending to client
    const cleanReply = reply.replace(/\[\[PRODUCT:[^\]]+\]\]/g, "").replace(/\s{2,}/g, " ").trim();

    res.json({ reply: cleanReply, products });
  } catch (err) {
    next(err);
  }
}

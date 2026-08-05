import { Response, NextFunction } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";
import { ApiError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";

async function getCartWithDetails(userId: string) {
  const cart = await Cart.findOne({ userId }).populate("items.productId");

  if (!cart) {
    return {
      items: [],
      total: 0,
    };
  }

  const items = cart.items
    .map((item: any) => {
      const product = item.productId;

      if (!product) return null;

      return {
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        stock: product.stock,
        quantity: item.quantity,
        lineTotal: Number(
          (product.price * item.quantity).toFixed(2)
        ),
      };
    })
    .filter(Boolean);

  const total = items.reduce(
    (sum: number, item: any) => sum + item.lineTotal,
    0
  );

  return {
    items,
    total: Number(total.toFixed(2)),
  };
}

export async function getCart(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    res.json(await getCartWithDetails(req.user!.id));
  } catch (err) {
    next(err);
  }
}

export async function addToCart(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      throw new ApiError(400, "productId is required");
    }

    const qty = Number(quantity) || 1;

    const product = await Product.findById(productId);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    let cart = await Cart.findOne({
      userId: req.user!.id,
    });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user!.id,
        items: [],
      });
    }

    const existing = cart.items.find(
      (item: any) =>
        item.productId.toString() === productId
    );

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.items.push({
        productId,
        quantity: qty,
      });
    }

    await cart.save();

    res.status(201).json(
      await getCartWithDetails(req.user!.id)
    );
  } catch (err) {
    next(err);
  }
}

export async function updateCartItem(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (
      quantity === undefined ||
      Number(quantity) < 1
    ) {
      throw new ApiError(
        400,
        "quantity must be at least 1"
      );
    }

    const cart = await Cart.findOne({
      userId: req.user!.id,
    });

    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    const existing = cart.items.find(
      (item: any) =>
        item.productId.toString() === productId
    );

    if (!existing) {
      throw new ApiError(
        404,
        "Item not in cart"
      );
    }

    existing.quantity = Number(quantity);

    await cart.save();

    res.json(
      await getCartWithDetails(req.user!.id)
    );
  } catch (err) {
    next(err);
  }
}

export async function removeCartItem(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId } = req.params;

    await Cart.updateOne(
      { userId: req.user!.id },
      {
        $pull: {
          items: {
            productId,
          },
        },
      }
    );

    res.json(
      await getCartWithDetails(req.user!.id)
    );
  } catch (err) {
    next(err);
  }
}

export async function clearCart(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    await Cart.updateOne(
      { userId: req.user!.id },
      {
        $set: {
          items: [],
        },
      }
    );

    res.json(
      await getCartWithDetails(req.user!.id)
    );
  } catch (err) {
    next(err);
  }
}
import { Response, NextFunction } from "express";
import crypto from "crypto";

import Order from "../models/Order";
import Cart from "../models/Cart";
import Product from "../models/Product";
import User from "../models/User";

import { ApiError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import {
  sendMail,
  orderConfirmationEmail,
  orderStatusUpdateEmail,
} from "../services/emailService";

const VALID_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
export async function checkout(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      throw new ApiError(
        400,
        "shippingAddress is required"
      );
    }

    const cart = await Cart.findOne({
      userId: req.user!.id,
    }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      throw new ApiError(
        400,
        "Your cart is empty"
      );
    }

    const items: any[] = [];

    for (const cartItem of cart.items as any[]) {
      const product = cartItem.productId;

      if (!product) continue;

      if (product.stock < cartItem.quantity) {
        throw new ApiError(
          400,
          `Not enough stock for "${product.title}"`
        );
      }

      items.push({
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity: cartItem.quantity,
      });
    }

    if (items.length === 0) {
      throw new ApiError(
        400,
        "No valid items in cart"
      );
    }

    // Deduct stock
    for (const item of items) {
      await Product.updateOne(
        { _id: item.productId },
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      );
    }

    const total = Number(
      items
        .reduce(
          (sum, item) =>
            sum + item.price * item.quantity,
          0
        )
        .toFixed(2)
    );

    const order = await Order.create({
      orderNumber: crypto
        .randomUUID()
        .slice(0, 8)
        .toUpperCase(),

      userId: req.user!.id,

      items,

      total,

      status: "pending",

      shippingAddress,
    });

    cart.items = [];

    await cart.save();

    const user = await User.findById(
      req.user!.id
    );

    if (user) {
      const { subject, html } =
        orderConfirmationEmail(
          user.name,
          order.orderNumber,
          order.total
        );

      await sendMail({
        to: user.email,
        subject,
        html,
      });
    }

    res.status(201).json({
      order,
    });
  } catch (err) {
    next(err);
  }
}
export async function myOrders(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const orders = await Order.find({
      userId: req.user!.id,
    }).sort({
      createdAt: -1,
    });

    res.json({
      orders,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyOrder(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.id,
      userId: req.user!.id,
    });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    res.json({
      order,
    });
  } catch (err) {
    next(err);
  }
}
// ---- Admin ----
export async function listAllOrders(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const orders = await Order.find()
      .sort({
        createdAt: -1,
      })
      .populate("userId", "name email");

    const enriched = orders.map((order: any) => ({
      ...order.toJSON(),

      customerName:
        order.userId?.name ?? "Unknown",

      customerEmail:
        order.userId?.email ?? "Unknown",
    }));

    res.json({
      orders: enriched,
    });
  } catch (err) {
    next(err);
  }
}
export async function updateOrderStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      throw new ApiError(
        400,
        `status must be one of: ${VALID_STATUSES.join(", ")}`
      );
    }

    const order = await Order.findOneAndUpdate(
      {
        orderNumber: req.params.id,
      },
      {
        status,
      },
      {
        new: true,
      }
    );

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Notify the customer about the status change
    const user = await User.findById(order.userId);
    if (user) {
      const { subject, html } = orderStatusUpdateEmail(
        user.name,
        order.orderNumber,
        status
      );
      // Fire-and-forget — don't block the response if email fails
      sendMail({ to: user.email, subject, html }).catch((err) =>
        console.error("Status update email failed:", err)
      );
    }

    res.json({
      order,
    });
  } catch (err) {
    next(err);
  }
}

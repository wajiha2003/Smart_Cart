import { Response, NextFunction } from "express";
import User from "../models/User";
import Product from "../models/Product";
import Order from "../models/Order";
import { ApiError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";

export async function listUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // passwordHash is removed automatically by User model's toJSON()
    const users = await User.find();

    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { role } = req.body;

    if (!["customer", "admin"].includes(role)) {
      throw new ApiError(400, 'role must be "customer" or "admin"');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.json({
      message: "Role updated",
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.json({
      message: "User deleted",
    });
  } catch (err) {
    next(err);
  }
}

export async function dashboardOverview(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalProducts,
      totalOrders,
      lowStock,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments({ stock: { $lte: 5 } }),

      Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$total",
            },
          },
        },
      ]),

      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "name"),
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const formattedOrders = recentOrders.map((order: any) => ({
      id: order.orderNumber ?? order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      customerName: order.userId?.name ?? "Unknown",
    }));

    res.json({
      stats: {
        totalUsers,
        totalCustomers,
        totalProducts,
        totalOrders,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        lowStock,
      },
      recentOrders: formattedOrders,
    });
  } catch (err) {
    next(err);
  }
}
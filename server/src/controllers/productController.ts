import { Response, NextFunction } from "express";
import Product from "../models/Product";
import { ApiError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";

export async function listProducts(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { category, search } = req.query;

    const filter: any = {};

    if (category && typeof category === "string") {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    if (search && typeof search === "string") {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const products = await Product.find(filter).sort({
      createdAt: -1,
    });

    res.json({
      products,
    });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      throw new ApiError(
        404,
        "Product not found"
      );
    }

    res.json({
      product,
    });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      title,
      description,
      highlights,
      category,
      price,
      stock,
      image,
    } = req.body;

    if (
      !title ||
      !category ||
      price === undefined
    ) {
      throw new ApiError(
        400,
        "title, category and price are required"
      );
    }

    const product = await Product.create({
      title,
      description: description || "",
      highlights: Array.isArray(highlights)
        ? highlights
        : [],
      category,
      price: Number(price),
      stock: Number(stock) || 0,
      image: image || "",
    });

    res.status(201).json({
      product,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      title,
      description,
      highlights,
      category,
      price,
      stock,
      image,
    } = req.body;

    const updates: any = {};

    if (title !== undefined)
      updates.title = title;

    if (description !== undefined)
      updates.description = description;

    if (highlights !== undefined)
      updates.highlights = highlights;

    if (category !== undefined)
      updates.category = category;

    if (price !== undefined)
      updates.price = Number(price);

    if (stock !== undefined)
      updates.stock = Number(stock);

    if (image !== undefined)
      updates.image = image;

    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        updates,
        {
          new: true,
        }
      );

    if (!product) {
      throw new ApiError(
        404,
        "Product not found"
      );
    }

    res.json({
      product,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const product =
      await Product.findByIdAndDelete(
        req.params.id
      );

    if (!product) {
      throw new ApiError(
        404,
        "Product not found"
      );
    }

    res.json({
      message: "Product deleted",
    });
  } catch (err) {
    next(err);
  }
}
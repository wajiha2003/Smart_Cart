import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import User from "../models/User";
import PasswordResetToken from "../models/PasswordResetToken";

import { signToken } from "../utils/jwt";
import { ApiError } from "../middleware/errorHandler";
import {
  sendMail,
  welcomeEmail,
  passwordResetEmail,
} from "../services/emailService";
import { AuthRequest } from "../middleware/auth";

export async function signup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, "name, email and password are required");
    }

    if (password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }

    const existing = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existing) {
      throw new ApiError(
        409,
        "An account with this email already exists"
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "customer",
    });

    const { subject, html } = welcomeEmail(user.name);

    await sendMail({
      to: user.email,
      subject,
      html,
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(
        400,
        "email and password are required"
      );
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      throw new ApiError(
        401,
        "Invalid email or password"
      );
    }

    const match = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!match) {
      throw new ApiError(
        401,
        "Invalid email or password"
      );
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function me(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await User.findById(req.user!.id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.json({
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function requestPasswordReset(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, "email is required");
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    // Always return the same response to avoid leaking account existence
    if (user) {
      const token = crypto.randomUUID();

      const expiresAt = new Date(
        Date.now() + 60 * 60 * 1000
      );

      await PasswordResetToken.create({
        token,
        userId: user._id,
        expiresAt,
      });

      const clientUrl =
        process.env.CLIENT_URL ||
        "http://localhost:5173";

      const resetLink = `${clientUrl}/reset-password/${token}`;

      const { subject, html } = passwordResetEmail(
        user.name,
        resetLink
      );

      await sendMail({
        to: user.email,
        subject,
        html,
      });
    }

    res.json({
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new ApiError(
        400,
        "token and password are required"
      );
    }

    if (password.length < 6) {
      throw new ApiError(
        400,
        "Password must be at least 6 characters"
      );
    }

    const entry = await PasswordResetToken.findOne({
      token,
    });

    if (!entry || entry.expiresAt < new Date()) {
      throw new ApiError(
        400,
        "This reset link is invalid or has expired"
      );
    }

    const passwordHash = await bcrypt.hash(
      password,
      10
    );

    await User.findByIdAndUpdate(entry.userId, {
      passwordHash,
    });

    await PasswordResetToken.deleteOne({
      token,
    });

    res.json({
      message:
        "Password has been reset successfully",
    });
  } catch (err) {
    next(err);
  }
}
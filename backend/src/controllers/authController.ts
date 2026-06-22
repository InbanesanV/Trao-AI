import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Helper: sign a JWT with user payload
const signToken = (id: string, email: string): string => {
  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id, email }, secret, { expiresIn } as jwt.SignOptions);
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are all required.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    // Check for existing account
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in.',
      });
      return;
    }

    // Create user — password is hashed by the pre-save hook in User.ts
    const user = await User.create({ name, email, password });

    const token = signToken(user.id as string, user.email);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to Trao AI!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Register error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.',
    });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
      return;
    }

    // Explicitly select password (excluded by default in schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      // Generic message to prevent user enumeration attacks
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const token = signToken(user.id as string, user.email);

    res.status(200).json({
      success: true,
      message: 'Login successful. Welcome back!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Login error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.',
    });
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
export const getMe = async (req: Request & { user?: { id: string; email: string } }, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

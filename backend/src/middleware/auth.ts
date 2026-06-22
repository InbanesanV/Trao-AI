import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

interface JwtPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Enforce Authorization header: "Bearer <token>"
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Access Denied. Missing or malformed Authorization token.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token || token.trim() === '') {
    res.status(401).json({
      success: false,
      message: 'Access Denied. Token is empty.',
    });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured on the server.');
    }

    const verified = jwt.verify(token, jwtSecret) as JwtPayload;

    // Attach verified user identity to the request context
    req.user = {
      id: verified.id,
      email: verified.email,
    };

    next();
  } catch (error) {
    const err = error as Error;

    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Security token has expired. Please log in again.',
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: 'Invalid or tampered security token.',
    });
  }
};

export default authMiddleware;

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { isActiveSession } from "../utils/sessionStore.js";

const jwtOptions = {
  issuer: process.env.JWT_ISSUER || "ndr-portal",
  audience: process.env.JWT_AUDIENCE || "ndr-users",
};

/**
 * JWT Authentication Middleware
 * Verifies token and attaches user to request object
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.'
      });
    }

    // Verify token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, jwtOptions);

    if (!isActiveSession(decoded.id, decoded.role || 'USER', token)) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.'
      });
    }

    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'phone', 'company', 'role', 'is_active']
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Authorization denied.'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated.'
      });
    }

    // Attach user to request object
    req.user = user;
    req.token = token;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Authorization denied.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
      error: error.message
    });
  }
};

export default authMiddleware;

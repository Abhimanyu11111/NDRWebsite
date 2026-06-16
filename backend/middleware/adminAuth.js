import jwt from "jsonwebtoken";
import { isActiveSession } from "../utils/sessionStore.js";

const jwtOptions = {
  issuer: process.env.JWT_ISSUER || "ndr-portal",
  audience: process.env.JWT_AUDIENCE || "ndr-users",
};

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }
  return process.env.JWT_SECRET;
};

//Admin verification
export const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false,
      message: "No token provided" 
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret(), jwtOptions);

    //  Check for ADMIN role (uppercase)
    if (decoded.role !== "ADMIN") {
      return res.status(403).json({ 
        success: false,
        message: "Admin access denied" 
      });
    }

    if (!isActiveSession(decoded.id, decoded.role, token)) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again"
      });
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false,
      message: "Invalid or expired token" 
    });
  }
};

// User authentication (for regular users)
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false,
      message: "No token provided" 
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret(), jwtOptions);
    if (!isActiveSession(decoded.id, decoded.role || "USER", token)) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again"
      });
    }
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    return res.status(403).json({ 
      success: false,
      message: "Invalid or expired token" 
    });
  }
};

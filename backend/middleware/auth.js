import jwt from "jsonwebtoken";
import { isActiveSession } from "../utils/sessionStore.js";

const jwtOptions = {
  issuer: process.env.JWT_ISSUER || "ndr-portal",
  audience: process.env.JWT_AUDIENCE || "ndr-users",
};

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, jwtOptions);

    if (!isActiveSession(decoded.id, decoded.role || "USER", token)) {
      return res.status(401).json({ message: "Unauthorized: Session expired" });
    }

    // LINE
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    req.token = token;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export default authMiddleware;

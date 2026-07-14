import jwt from "jsonwebtoken";
import { isActiveSession } from "../utils/sessionStore.js";

const jwtOptions = {
  issuer: process.env.JWT_ISSUER || "ndr-portal",
  audience: process.env.JWT_AUDIENCE || "ndr-users",
};
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "ndr_auth";

const getCookieToken = (req) => {
  const cookieHeader = req.headers.cookie || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim().split("="))
      .filter(([key, value]) => key && value)
      .map(([key, value]) => [key, decodeURIComponent(value)])
  );
  return cookies[AUTH_COOKIE_NAME];
};

const getRequestToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.split(" ")[1];
  return getCookieToken(req);
};

const authMiddleware = (req, res, next) => {
  const token = getRequestToken(req);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token missing" });
  }

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

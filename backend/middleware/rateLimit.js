const buckets = new Map();

export const rateLimit = ({ windowMs, max, keyPrefix = "global", message }) => {
  return (req, res, next) => {
    const key = `${keyPrefix}:${req.ip}:${String(req.body?.email || "").toLowerCase()}`;
    const now = Date.now();
    const current = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (current.resetAt <= now) {
      current.count = 0;
      current.resetAt = now + windowMs;
    }

    current.count += 1;
    buckets.set(key, current);

    if (current.count > max) {
      return res.status(429).json({
        success: false,
        msg: message || "Too many attempts. Please try again later.",
      });
    }

    next();
  };
};

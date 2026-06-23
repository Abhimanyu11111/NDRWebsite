const buckets = new Map();

const cleanupExpiredBuckets = (now) => {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
};

export const rateLimit = ({ windowMs, max, keyPrefix = "global", message, includeEmail = true }) => {
  return (req, res, next) => {
    const emailPart = includeEmail ? `:${String(req.body?.email || "").toLowerCase()}` : "";
    const key = `${keyPrefix}:${req.ip}${emailPart}`;
    const now = Date.now();
    const current = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (current.resetAt <= now) {
      current.count = 0;
      current.resetAt = now + windowMs;
    }

    current.count += 1;
    buckets.set(key, current);

    if (buckets.size > 10000) cleanupExpiredBuckets(now);

    if (current.count > max) {
      res.set("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
      return res.status(429).json({
        success: false,
        msg: message || "Too many attempts. Please try again later.",
      });
    }

    next();
  };
};

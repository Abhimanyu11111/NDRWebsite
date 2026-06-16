import crypto from "crypto";

const getSecret = () => process.env.CAPTCHA_SECRET || process.env.JWT_SECRET;

const sign = (payload) => {
  const secret = getSecret();
  if (!secret) throw new Error("CAPTCHA_SECRET or JWT_SECRET is required");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
};

export const createCaptchaChallenge = () => {
  const left = crypto.randomInt(2, 10);
  const right = crypto.randomInt(2, 10);
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const nonce = crypto.randomBytes(12).toString("hex");
  const answer = String(left + right);
  const payload = `${answer}.${expiresAt}.${nonce}`;

  return {
    question: `${left} + ${right} = ?`,
    token: `${expiresAt}.${nonce}.${sign(payload)}`,
  };
};

export const verifyCaptchaChallenge = ({ token, answer }) => {
  if (!token || answer == null) return false;

  const [expiresAt, nonce, signature] = String(token).split(".");
  if (!expiresAt || !nonce || !signature || Number(expiresAt) < Date.now()) {
    return false;
  }

  const normalizedAnswer = String(answer).trim();
  const expected = sign(`${normalizedAnswer}.${expiresAt}.${nonce}`);
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

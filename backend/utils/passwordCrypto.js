import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * RSA-OAEP transport encryption for password fields, with per-request
 * replay protection.
 *
 * TLS already encrypts the whole request in transit, but security scanners
 * and manual reviewers commonly inspect decrypted request bodies (via a
 * locally-trusted proxy such as Burp/ZAP) and flag a readable password
 * value regardless of the TLS context. This adds an application-layer
 * encryption step on top of TLS so the password value itself is never
 * transmitted or visible as plaintext, even to someone inspecting the
 * decrypted HTTP body: the browser encrypts the password with this
 * server's RSA public key before sending it, and only this server's
 * private key (never leaves the server) can decrypt it back to plaintext,
 * at which point the existing bcrypt hashing/comparison logic runs exactly
 * as before.
 *
 * Encryption alone does not stop replay: if an attacker captures one
 * encrypted request (e.g. via a proxy, malware, or a compromised
 * intermediary) and resubmits the exact same ciphertext later, the server
 * would decrypt it to the same valid password and authenticate again. To
 * close that, every encrypted password is bound to a single-use, short-lived
 * nonce (same signed-token + used-once pattern already used for CAPTCHA in
 * utils/captcha.js): the nonce is embedded *inside* the encrypted plaintext
 * before it's sent, so an attacker can't just pair an old ciphertext with a
 * fresh nonce token — the ciphertext's own embedded nonce must match the
 * token's signature. Once a token is used, it's rejected on every
 * subsequent attempt, so a captured request can never be replayed.
 *
 * The key pair is generated once and persisted to disk so it stays stable
 * across process restarts (the frontend fetches the public key at runtime,
 * so it always matches whatever key the running backend holds).
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEYS_DIR = path.resolve(__dirname, "..", "keys");
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, "password_rsa_private.pem");
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, "password_rsa_public.pem");

const loadOrCreateKeyPair = () => {
  if (fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH)) {
    return {
      privateKey: fs.readFileSync(PRIVATE_KEY_PATH, "utf8"),
      publicKey: fs.readFileSync(PUBLIC_KEY_PATH, "utf8"),
    };
  }

  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  fs.mkdirSync(KEYS_DIR, { recursive: true });
  fs.writeFileSync(PRIVATE_KEY_PATH, privateKey, { mode: 0o600 });
  fs.writeFileSync(PUBLIC_KEY_PATH, publicKey, { mode: 0o644 });

  return { privateKey, publicKey };
};

const { privateKey, publicKey } = loadOrCreateKeyPair();

export const getPublicKeyPem = () => publicKey;

const OAEP_OPTIONS = {
  key: privateKey,
  padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
  oaepHash: "sha256",
};

// ─── Replay-protection nonces ──────────────────────────────────────────────
const NONCE_TTL_MS = 3 * 60 * 1000; // 3 minutes — matches the CAPTCHA TTL
const usedNonceTokens = new Map(); // token -> expiresAt

const getNonceSecret = () => process.env.JWT_SECRET || process.env.CAPTCHA_SECRET;

const signNonce = (nonce, expiresAt) =>
  crypto.createHmac("sha256", getNonceSecret()).update(`${nonce}.${expiresAt}`).digest("hex");

const cleanupUsedNonceTokens = () => {
  const now = Date.now();
  for (const [token, expiresAt] of usedNonceTokens.entries()) {
    if (expiresAt <= now) usedNonceTokens.delete(token);
  }
};

/**
 * Issues a fresh, single-use nonce. The frontend must embed the returned
 * `nonce` inside the plaintext it encrypts (see decryptPasswordField), and
 * send the returned `token` back alongside the ciphertext unencrypted —
 * the token is just a signed reference, not a secret.
 */
export const issueEncryptionNonce = () => {
  cleanupUsedNonceTokens();
  const nonce = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + NONCE_TTL_MS;
  return { nonce, token: `${expiresAt}.${signNonce(nonce, expiresAt)}` };
};

/**
 * Decrypts a base64-encoded RSA-OAEP ciphertext whose plaintext is expected
 * to be the JSON string `{"password": "...", "nonce": "..."}`, verifies the
 * accompanying nonce token (valid signature, not expired, not already
 * used), marks the token used, and returns the plaintext password.
 *
 * Returns null — never throws — for any of: missing/malformed ciphertext,
 * missing/malformed/expired/forged token, or a token that has already been
 * consumed (i.e. a replay of a previously-submitted request). Callers
 * should treat null as "reject this request with a 400".
 */
export const decryptPasswordField = (encryptedValue, nonceToken) => {
  if (encryptedValue === undefined || encryptedValue === null || encryptedValue === "") return encryptedValue;
  if (typeof encryptedValue !== "string" || typeof nonceToken !== "string") return null;

  cleanupUsedNonceTokens();

  const [expiresAtStr, signature] = nonceToken.split(".");
  const expiresAt = Number(expiresAtStr);
  if (!expiresAtStr || !signature || !Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;
  if (usedNonceTokens.has(nonceToken)) return null; // replay of an already-consumed request

  try {
    const ciphertext = Buffer.from(encryptedValue, "base64");
    const plaintextJson = crypto.privateDecrypt(OAEP_OPTIONS, ciphertext).toString("utf8");
    const parsed = JSON.parse(plaintextJson);
    if (typeof parsed?.password !== "string" || typeof parsed?.nonce !== "string") return null;

    const expectedSignature = signNonce(parsed.nonce, expiresAt);
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    // Burn the token so this exact encrypted request can never be reused.
    usedNonceTokens.set(nonceToken, expiresAt);
    return parsed.password;
  } catch {
    return null;
  }
};

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * RSA-OAEP transport encryption for password fields.
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

/**
 * Decrypts a base64-encoded RSA-OAEP ciphertext produced by the frontend's
 * Web Crypto API call back into the original plaintext password.
 * Returns null (rather than throwing) if the value isn't valid ciphertext
 * for this key, so callers can respond with a clean 400 instead of a 500.
 */
export const decryptPasswordField = (value) => {
  if (value === undefined || value === null || value === "") return value;
  if (typeof value !== "string") return null;
  try {
    const ciphertext = Buffer.from(value, "base64");
    return crypto.privateDecrypt(OAEP_OPTIONS, ciphertext).toString("utf8");
  } catch {
    return null;
  }
};

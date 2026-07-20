// Encrypts password fields with the backend's RSA public key (RSA-OAEP,
// SHA-256) before they're sent over the wire. TLS already encrypts the
// whole request in transit, but security review tools commonly inspect the
// decrypted HTTP body directly (via a locally-trusted proxy) and flag a
// readable password value regardless of the TLS context. This adds an
// application-layer encryption step so the password value itself is never
// visible as plaintext in the request body — only this server's private
// key (see backend/utils/passwordCrypto.js) can decrypt it back.

let cachedKeyPromise = null;

const pemToArrayBuffer = (pem) => {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
};

const getPublicKey = () => {
  if (!cachedKeyPromise) {
    cachedKeyPromise = fetch(`${import.meta.env.VITE_API_URL}/auth/public-key`)
      .then((res) => res.json())
      .then(({ publicKey }) =>
        window.crypto.subtle.importKey(
          "spki",
          pemToArrayBuffer(publicKey),
          { name: "RSA-OAEP", hash: "SHA-256" },
          false,
          ["encrypt"]
        )
      )
      .catch((err) => {
        // Don't leave a rejected promise cached — let the next call retry.
        cachedKeyPromise = null;
        throw err;
      });
  }
  return cachedKeyPromise;
};

/**
 * Encrypts a plaintext password for transmission. Returns a base64 string
 * suitable for sending as the request field value in place of the raw
 * password.
 *
 * The backend only ever accepts an RSA-OAEP-encrypted value for password
 * fields (see backend/utils/passwordCrypto.js) and rejects anything else
 * with a 400, so there is no safe silent fallback to plaintext here — if
 * encryption fails (unsupported browser, public key unreachable, ...) this
 * throws, and callers must catch it and show the user an error instead of
 * submitting the form.
 */
export const encryptPassword = async (plaintext) => {
  if (!window.isSecureContext || !window.crypto?.subtle) {
    throw new Error("This browser cannot securely submit the form. Please update your browser.");
  }
  const key = await getPublicKey();
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, encoded);
  return arrayBufferToBase64(ciphertext);
};

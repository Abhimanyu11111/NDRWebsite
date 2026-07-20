// Encrypts password fields with the backend's RSA public key (RSA-OAEP,
// SHA-256) before they're sent over the wire. TLS already encrypts the
// whole request in transit, but security review tools commonly inspect the
// decrypted HTTP body directly (via a locally-trusted proxy) and flag a
// readable password value regardless of the TLS context. This adds an
// application-layer encryption step so the password value itself is never
// visible as plaintext in the request body — only this server's private
// key (see backend/utils/passwordCrypto.js) can decrypt it back.
//
// Encryption alone doesn't stop replay: capturing one encrypted request and
// resending the exact same ciphertext would otherwise still authenticate.
// Every call fetches a fresh, single-use nonce from the backend and embeds
// it inside the encrypted payload, so the backend can detect and reject a
// replayed request even though the ciphertext decrypts successfully.

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

const getFreshNonce = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/encryption-nonce`);
  const data = await res.json();
  if (!data?.nonce || !data?.token) throw new Error("Unable to prepare a secure request.");
  return data;
};

/**
 * Encrypts a plaintext password for transmission. Returns
 * `{ ciphertext, nonceToken }` — send both fields to the backend (see the
 * `*NonceToken` fields expected by backend/routes/authRoutes.js). Never
 * send just the ciphertext alone; the token is required to verify it and
 * to detect replay.
 *
 * The backend only ever accepts an RSA-OAEP-encrypted value with a valid,
 * unused nonce token for password fields (see
 * backend/utils/passwordCrypto.js) and rejects anything else with a 400,
 * so there is no safe silent fallback to plaintext here — if encryption
 * fails (unsupported browser, network error fetching the key/nonce, ...)
 * this throws, and callers must catch it and show the user an error
 * instead of submitting the form.
 */
export const encryptPassword = async (plaintext) => {
  if (!window.isSecureContext || !window.crypto?.subtle) {
    throw new Error("This browser cannot securely submit the form. Please update your browser.");
  }
  // The nonce must be fetched fresh for every single encryption — caching
  // it would defeat the whole point of replay protection.
  const [key, { nonce, token }] = await Promise.all([getPublicKey(), getFreshNonce()]);
  const encoded = new TextEncoder().encode(JSON.stringify({ password: plaintext, nonce }));
  const ciphertext = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, encoded);
  return { ciphertext: arrayBufferToBase64(ciphertext), nonceToken: token };
};

import crypto from "crypto";

export const encrypt = (plainText, workingKey) => {
  const cipher = crypto.createCipheriv(
    "aes-128-cbc",
    workingKey,
    workingKey
  );
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

export const decrypt = (encText, workingKey) => {
  const decipher = crypto.createDecipheriv(
    "aes-128-cbc",
    workingKey,
    workingKey
  );
  let decrypted = decipher.update(encText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
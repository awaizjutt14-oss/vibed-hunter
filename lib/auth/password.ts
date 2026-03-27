import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;

function deriveKey(password: string, salt: string) {
  return scryptSync(password, salt, KEY_LENGTH);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = deriveKey(password, salt).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) return false;

  const derived = deriveKey(password, salt);
  const stored = Buffer.from(hash, "hex");

  if (derived.length !== stored.length) return false;

  return timingSafeEqual(derived, stored);
}

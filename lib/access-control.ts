import { env } from "@/lib/utils/env";

function parseAllowedEmails(raw?: string) {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function getAllowedEmails() {
  return parseAllowedEmails(env.ALLOWED_EMAILS);
}

export function isAllowedEmail(email?: string | null) {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return false;

  const allowedEmails = getAllowedEmails();
  if (!allowedEmails.size) return true;

  return allowedEmails.has(normalizedEmail);
}

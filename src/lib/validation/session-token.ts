import { createHmac } from "crypto";

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret(): string {
  const secret = process.env.VALIDATION_SESSION_SECRET;
  if (!secret) throw new Error("VALIDATION_SESSION_SECRET is not set");
  return secret;
}

export function createSessionToken(eventId: string, tenantId: string): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${eventId}:${tenantId}:${expiresAt}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifySessionToken(
  token: string,
): { eventId: string; tenantId: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split(":");
    if (parts.length !== 4) return null;

    const [eventId, tenantId, expiresAtStr, sig] = parts;
    const expiresAt = Number(expiresAtStr);

    if (Date.now() > expiresAt) return null;

    const payload = `${eventId}:${tenantId}:${expiresAtStr}`;
    const expected = createHmac("sha256", getSecret())
      .update(payload)
      .digest("hex");

    if (sig !== expected) return null;

    return { eventId, tenantId };
  } catch {
    return null;
  }
}

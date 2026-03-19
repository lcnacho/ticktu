import { createHmac, randomUUID } from "crypto";

const QR_SECRET = process.env.QR_SIGNING_SECRET || "default-dev-secret";

export function generateQrPayload(): { qrCode: string; qrHash: string } {
  const qrCode = randomUUID();
  const qrHash = createHmac("sha256", QR_SECRET)
    .update(qrCode)
    .digest("hex");

  return { qrCode, qrHash };
}

export function verifyQrHash(qrCode: string, qrHash: string): boolean {
  const expected = createHmac("sha256", QR_SECRET)
    .update(qrCode)
    .digest("hex");
  return expected === qrHash;
}

import { describe, expect, it } from "vitest";
import { generateQrPayload, verifyQrHash } from "./generate";

describe("QR generation", () => {
  it("generates unique QR codes", () => {
    const results = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      const { qrHash } = generateQrPayload();
      results.add(qrHash);
    }
    expect(results.size).toBe(1000);
  });

  it("verifies QR hash with correct secret", () => {
    const { qrCode, qrHash } = generateQrPayload();
    expect(verifyQrHash(qrCode, qrHash)).toBe(true);
  });

  it("rejects QR hash with wrong qrCode", () => {
    const { qrHash } = generateQrPayload();
    expect(verifyQrHash("wrong-code", qrHash)).toBe(false);
  });

  it("QR payload does not contain raw ticket ID patterns", () => {
    const { qrHash } = generateQrPayload();
    // UUID pattern check - qrHash should be a hex string, not a UUID
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    expect(uuidPattern.test(qrHash)).toBe(false);
  });

  it("generates hex hash string", () => {
    const { qrHash } = generateQrPayload();
    expect(qrHash).toMatch(/^[0-9a-f]{64}$/);
  });
});

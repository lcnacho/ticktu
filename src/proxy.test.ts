import { describe, expect, it } from "vitest";
import { extractSubdomain } from "./proxy";

describe("extractSubdomain", () => {
  it("returns null for bare localhost", () => {
    expect(extractSubdomain("localhost:3000")).toBeNull();
  });

  it("extracts subdomain from subdomain.localhost", () => {
    expect(extractSubdomain("odisea.localhost:3000")).toBe("odisea");
  });

  it("extracts admin subdomain", () => {
    expect(extractSubdomain("admin.localhost:3000")).toBe("admin");
  });

  it("extracts subdomain from nip.io", () => {
    expect(extractSubdomain("odisea.127.0.0.1.nip.io:3000")).toBe("odisea");
  });

  it("extracts subdomain from production domain", () => {
    expect(extractSubdomain("odisea.ticktu.com")).toBe("odisea");
  });

  it("returns null for bare production domain", () => {
    expect(extractSubdomain("ticktu.com")).toBeNull();
  });

  it("returns null for unknown domain", () => {
    expect(extractSubdomain("example.com")).toBeNull();
  });
});

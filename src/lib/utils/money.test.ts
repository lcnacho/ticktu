import { describe, expect, it } from "vitest";
import { calculateServiceFee, formatMoney } from "./money";

describe("calculateServiceFee", () => {
  it("returns percentage-based fee when higher than fixed", () => {
    // price=2500, 10% = 250, fixed=150 → max=250
    expect(calculateServiceFee(2500, 10, 150)).toBe(250);
  });

  it("returns fixed fee when higher than percentage", () => {
    // price=1000, 10% = 100, fixed=150 → max=150
    expect(calculateServiceFee(1000, 10, 150)).toBe(150);
  });

  it("returns 0 for zero price (complimentary)", () => {
    expect(calculateServiceFee(0, 10, 150)).toBe(0);
  });

  it("returns 0 for negative price", () => {
    expect(calculateServiceFee(-100, 10, 150)).toBe(0);
  });

  it("handles 1 cent price", () => {
    // price=1, 10% = 0.1 → rounds to 0, fixed=50 → max=50
    expect(calculateServiceFee(1, 10, 50)).toBe(50);
  });

  it("handles large prices", () => {
    // price=10000000 (100k), 5% = 500000, fixed=150 → max=500000
    expect(calculateServiceFee(10000000, 5, 150)).toBe(500000);
  });

  it("rounds percentage fee correctly", () => {
    // price=333, 10% = 33.3 → rounds to 33
    expect(calculateServiceFee(333, 10, 0)).toBe(33);
    // price=335, 10% = 33.5 → rounds to 34
    expect(calculateServiceFee(335, 10, 0)).toBe(34);
  });
});

describe("formatMoney", () => {
  it("formats UYU currency", () => {
    const result = formatMoney(2500, "UYU");
    expect(result).toContain("25");
  });

  it("formats ARS currency", () => {
    const result = formatMoney(5000, "ARS");
    expect(result).toContain("50");
  });

  it("formats USD currency", () => {
    const result = formatMoney(1099, "USD");
    expect(result).toContain("10");
  });

  it("formats zero cents", () => {
    const result = formatMoney(0, "UYU");
    expect(result).toContain("0");
  });
});

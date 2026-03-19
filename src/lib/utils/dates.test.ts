import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime } from "./dates";

describe("formatDate", () => {
  it("formats a Date object with es-UY locale", () => {
    const date = new Date("2026-03-19T12:00:00Z");
    const result = formatDate(date);
    // es-UY format: DD/MM/YYYY
    expect(result).toMatch(/19\/03\/2026/);
  });

  it("formats a string date", () => {
    const result = formatDate("2026-12-25T00:00:00Z");
    expect(result).toMatch(/25\/12\/2026/);
  });
});

describe("formatDateTime", () => {
  it("includes time in output", () => {
    const date = new Date("2026-03-19T15:30:00Z");
    const result = formatDateTime(date);
    // Should contain date and time parts
    expect(result).toMatch(/19\/03\/2026/);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("my event name")).toBe("my-event-name");
  });

  it("removes accented characters", () => {
    expect(slugify("Fiesta de Año Nuevo")).toBe("fiesta-de-ano-nuevo");
  });

  it("removes special characters", () => {
    expect(slugify("Rock & Roll!!!")).toBe("rock-roll");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("a   b   c")).toBe("a-b-c");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("handles string with only special characters", () => {
    expect(slugify("!!!@@@###")).toBe("");
  });

  it("handles accented vowels in Spanish", () => {
    expect(slugify("música electrónica")).toBe("musica-electronica");
  });

  it("preserves numbers", () => {
    expect(slugify("Evento 2026")).toBe("evento-2026");
  });
});

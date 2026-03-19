import { describe, expect, it } from "vitest";
import { canTransition, getValidTransitions } from "./event-transitions";

describe("event transitions", () => {
  describe("canTransition", () => {
    it("allows draft to published", () => {
      expect(canTransition("draft", "published")).toBe(true);
    });

    it("allows published to finished", () => {
      expect(canTransition("published", "finished")).toBe(true);
    });

    it("allows finished to archived", () => {
      expect(canTransition("finished", "archived")).toBe(true);
    });

    it("disallows draft to finished", () => {
      expect(canTransition("draft", "finished")).toBe(false);
    });

    it("disallows draft to archived", () => {
      expect(canTransition("draft", "archived")).toBe(false);
    });

    it("disallows published to draft", () => {
      expect(canTransition("published", "draft")).toBe(false);
    });

    it("disallows archived to any state", () => {
      expect(canTransition("archived", "draft")).toBe(false);
      expect(canTransition("archived", "published")).toBe(false);
      expect(canTransition("archived", "finished")).toBe(false);
    });

    it("disallows cancelled to any state", () => {
      expect(canTransition("cancelled", "draft")).toBe(false);
      expect(canTransition("cancelled", "published")).toBe(false);
      expect(canTransition("cancelled", "finished")).toBe(false);
      expect(canTransition("cancelled", "archived")).toBe(false);
    });

    it("disallows published to archived (must finish first)", () => {
      expect(canTransition("published", "archived")).toBe(false);
    });
  });

  describe("getValidTransitions", () => {
    it("returns published for draft", () => {
      expect(getValidTransitions("draft")).toEqual(["published"]);
    });

    it("returns finished for published", () => {
      expect(getValidTransitions("published")).toEqual(["finished"]);
    });

    it("returns archived for finished", () => {
      expect(getValidTransitions("finished")).toEqual(["archived"]);
    });

    it("returns empty array for archived", () => {
      expect(getValidTransitions("archived")).toEqual([]);
    });

    it("returns empty array for cancelled", () => {
      expect(getValidTransitions("cancelled")).toEqual([]);
    });
  });
});

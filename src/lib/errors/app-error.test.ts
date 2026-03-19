import { describe, expect, it } from "vitest";
import { createAppError } from "./app-error";

describe("createAppError", () => {
  it("creates error with required fields", () => {
    const error = createAppError("TICKET_SOLD_OUT", "No quedan entradas", 400);
    expect(error).toEqual({
      code: "TICKET_SOLD_OUT",
      message: "No quedan entradas",
      statusCode: 400,
    });
  });

  it("includes field when provided", () => {
    const error = createAppError("VALIDATION_ERROR", "Email inválido", 400, "email");
    expect(error).toEqual({
      code: "VALIDATION_ERROR",
      message: "Email inválido",
      statusCode: 400,
      field: "email",
    });
  });

  it("does not include field key when not provided", () => {
    const error = createAppError("NOT_FOUND", "No encontrado", 404);
    expect(error).not.toHaveProperty("field");
  });
});

export type AppError = {
  code: string;
  message: string;
  field?: string;
  statusCode: number;
};

export function createAppError(
  code: string,
  message: string,
  statusCode: number,
  field?: string,
): AppError {
  return { code, message, statusCode, ...(field && { field }) };
}

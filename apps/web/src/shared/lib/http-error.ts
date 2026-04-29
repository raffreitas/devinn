import type { ApiProblem, ApiValidationErrors } from "@/shared/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(
  source: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = source[key];
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

function readNumber(
  source: Record<string, unknown>,
  key: string,
): number | undefined {
  const value = source[key];
  return typeof value === "number" ? value : undefined;
}

function isValidationErrors(value: unknown): value is ApiValidationErrors {
  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every((item) => typeof item === "string");
}

function readInlineMessage(error: unknown): string | undefined {
  if (!isRecord(error)) {
    return undefined;
  }

  return readString(error, "message");
}

export function asApiProblem(
  value: unknown,
  fallbackStatus?: number,
): ApiProblem | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = readString(value, "title");
  const detail = readString(value, "detail");
  const status = readNumber(value, "status") ?? fallbackStatus;
  const errors = isValidationErrors(value.errors) ? value.errors : undefined;

  if (!title && !detail && status === undefined && !errors) {
    return null;
  }

  return {
    title,
    detail,
    status,
    errors,
  };
}

export function getApiProblem(error: unknown): ApiProblem | null {
  if (!isRecord(error)) {
    return null;
  }

  const status = readNumber(error, "status");
  const directProblem =
    asApiProblem(error.problem, status) ?? asApiProblem(error, status);
  if (directProblem) {
    return directProblem;
  }

  if (!isRecord(error.response)) {
    return null;
  }

  return asApiProblem(
    error.response.data,
    readNumber(error.response, "status"),
  );
}

export function getValidationErrors(
  error: unknown,
): ApiValidationErrors | null {
  const problem = getApiProblem(error);

  if (problem?.errors && Object.keys(problem.errors).length > 0) {
    return problem.errors;
  }

  if (isRecord(error) && isValidationErrors(error.validationErrors)) {
    return error.validationErrors;
  }

  return null;
}

export function hasValidationErrors(error: unknown): boolean {
  return getValidationErrors(error) !== null;
}

export function getApiProblemMessage(
  problem: ApiProblem | null | undefined,
  fallback?: string,
): string {
  if (problem?.detail?.trim()) {
    return problem.detail;
  }

  if (problem?.title?.trim()) {
    return problem.title;
  }

  if (fallback?.trim()) {
    return fallback;
  }

  return "Falha ao processar sua requisição";
}

export function getHttpErrorMessage(error: unknown, fallback: string): string {
  return getApiProblemMessage(
    getApiProblem(error),
    readInlineMessage(error) ?? fallback,
  );
}

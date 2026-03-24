import type { ErrorInfo } from "react";

type ErrorContext = {
  source: "app-error-boundary" | "route-error-boundary";
};

export function logApplicationError(
  error: unknown,
  errorInfo?: ErrorInfo,
  context?: ErrorContext,
) {
  console.error("Application error captured", {
    source: context?.source ?? "unknown",
    error,
    componentStack: errorInfo?.componentStack,
  });
}

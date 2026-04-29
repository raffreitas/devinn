import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { getValidationErrors } from "@/shared/lib/http-error";

type ServerFieldMap<TFieldValues extends FieldValues> = Partial<
  Record<string, FieldPath<TFieldValues>>
>;

function normalizeServerFieldPath(path: string): string {
  return path.replace(/\[(\d+)\]/g, ".$1");
}

export function applyServerFormErrors<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  error: unknown,
  options?: {
    fieldMap?: ServerFieldMap<TFieldValues>;
  },
): boolean {
  const validationErrors = getValidationErrors(error);

  if (!validationErrors) {
    return false;
  }

  form.clearErrors();

  for (const [rawField, message] of Object.entries(validationErrors)) {
    const normalizedField = normalizeServerFieldPath(rawField);
    const targetField =
      options?.fieldMap?.[normalizedField] ??
      (normalizedField as FieldPath<TFieldValues>);

    form.setError(targetField, {
      type: "server",
      message,
    });
  }

  return true;
}

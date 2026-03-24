import { z } from "zod";

export function createPasswordSchema(label = "A senha") {
  return z
    .string()
    .min(8, `${label} deve ter no mínimo 8 caracteres`)
    .max(100, `${label} deve ter no máximo 100 caracteres`)
    .regex(
      /[^a-zA-Z0-9]/,
      `${label} deve conter pelo menos um caractere não alfanumérico`,
    )
    .regex(/\d/, `${label} deve conter pelo menos um número`)
    .regex(/[A-Z]/, `${label} deve conter pelo menos uma letra maiúscula`);
}

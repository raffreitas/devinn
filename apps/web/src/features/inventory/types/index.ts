import z from "zod";

// ############################# Category Types #############################

export interface Category {
  id: string;
  name: string;
  capacity: number;
  description?: string;
  basePrice: number;
  extraPersonPrice: number;
}

export type CreateCategoryRequest = Omit<Category, "id">;
export type UpdateCategoryRequest = Category;

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
  capacity: z
    .number()
    .min(1, "Capacidade mínima é 1")
    .max(10, "Capacidade máxima é 10"),
  basePrice: z.number().min(0, "Preço base deve ser maior ou igual a 0"),
  extraPersonPrice: z
    .number()
    .min(0, "Preço extra deve ser maior ou igual a 0"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// ############################# Room Types #############################

export type RoomStatus = "Active" | "Maintenance" | "Inactive";

export interface Room {
  id: string;
  categoryId: string;
  categoryName?: string;
  number: number;
  capacity: number;
  basePrice: number;
  extraGuestPrice: number;
  status: RoomStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
  activeIntegrationsCount?: number;
  iCalExportToken: string;
}

export type CreateRoomIntegrationInput = {
  channelType: "Booking" | "Airbnb";
  iCalUrl: string;
};

export type CreateRoomRequest = {
  categoryId: string;
  number: number;
  status: RoomStatus;
  description?: string;
  integrations?: CreateRoomIntegrationInput[];
};

export type UpdateRoomRequest = Partial<CreateRoomRequest>;

export const roomSchema = z.object({
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  number: z
    .number({ error: "Número do quarto é obrigatório" })
    .min(1, "Número do quarto é obrigatório")
    .refine((val) => {
      const num = val;
      return !Number.isNaN(num) && num >= 1 && num <= 999;
    }, "Número deve estar entre 1 e 999"),
  status: z.enum(["Active", "Maintenance", "Inactive"], {
    error: "Status é obrigatório",
  }),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
});

export type RoomFormData = z.infer<typeof roomSchema>;

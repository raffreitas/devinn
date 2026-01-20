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
}

export interface CreateRoomRequest {
  categoryId: string;
  number: number;
  capacity: number;
  basePrice: number;
  extraGuestPrice: number;
  status: RoomStatus;
  description?: string;
}

export interface UpdateRoomRequest {
  categoryId?: string;
  number?: number;
  capacity?: number;
  basePrice?: number;
  extraGuestPrice?: number;
  status?: RoomStatus;
  description?: string;
}

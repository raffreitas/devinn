export interface Category {
  id: string;
  name: string;
  capacity: number;
  description?: string;
  basePrice: number;
  extraPersonPrice: number;
}

export type CreateCategoryRequest = Omit<Category, "id">;
export type UpdateCategoryRequest = CreateCategoryRequest;

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

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

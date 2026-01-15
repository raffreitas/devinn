export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
}

export type RoomStatus = "Active" | "Maintenance" | "Inactive";

export interface Room {
  id: string;
  categoryId: string;
  categoryName?: string;
  roomNumber: string;
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
  roomNumber: string;
  capacity: number;
  basePrice: number;
  extraGuestPrice: number;
  status: RoomStatus;
  description?: string;
}

export interface UpdateRoomRequest {
  categoryId?: string;
  roomNumber?: string;
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

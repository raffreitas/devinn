export type ApiValidationErrors = Record<string, string>;

export type ApiProblem = {
  title?: string;
  detail?: string;
  status?: number;
  errors?: ApiValidationErrors;
};

export type ApiResponse<T> = {
  data: T;
  meta?: Metadata;
};

export interface Metadata {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

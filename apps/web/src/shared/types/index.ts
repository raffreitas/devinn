export type ApiProblem = {
  title: string;
  detail: string;
  status: number;
  errors: Record<string, string>;
};

export type ApiResponse<T> = {
  data?: T;
};

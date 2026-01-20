export type UserRole = "SuperAdmin" | "InnAdmin";

export type User = {
  id: string;
  role: UserRole;
};

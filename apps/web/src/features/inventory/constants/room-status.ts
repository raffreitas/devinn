import type { RoomStatus } from "../types";

export const ROOM_STATUS: Record<RoomStatus, string> = {
  Active: "Ativo",
  Maintenance: "Manutenção",
  Inactive: "Inativo",
} as const;

export function getRoomStatusOptions() {
  return (Object.keys(ROOM_STATUS) as RoomStatus[]).map((key) => ({
    value: key,
    label: ROOM_STATUS[key],
  }));
}

export function getRoomStatusOptionLabel(
  value?: keyof typeof ROOM_STATUS | string | null,
) {
  if (!value) return "-";
  if (value in ROOM_STATUS) {
    return ROOM_STATUS[value as keyof typeof ROOM_STATUS];
  }
  return String(value);
}

export const statusDisplayConfig: Record<
  RoomStatus,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  Active: { label: "Ativo", variant: "default" },
  Maintenance: { label: "Manutenção", variant: "secondary" },
  Inactive: { label: "Inativo", variant: "destructive" },
};

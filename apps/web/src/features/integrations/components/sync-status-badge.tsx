import { Badge } from "@/shared/components/ui/badge";
import type { SyncStatus } from "../types";

interface SyncStatusBadgeProps {
  syncStatus: SyncStatus;
}

export function SyncStatusBadge({ syncStatus }: SyncStatusBadgeProps) {
  const { status, lastSyncAt, importedCount, errorMessage } = syncStatus;

  const getBadgeVariant = () => {
    switch (status) {
      case "Success":
        return "default";
      case "Failed":
        return "destructive";
      case "Syncing":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getBadgeText = () => {
    switch (status) {
      case "Success":
        return lastSyncAt
          ? `Última sincronização: ${new Date(lastSyncAt).toLocaleString("pt-BR")} (${importedCount} reservas)`
          : `Sincronização concluída (${importedCount} reservas)`;
      case "Failed":
        return `Falhou: ${errorMessage}`;
      case "Syncing":
        return "Sincronizando...";
      default:
        return "Nunca sincronizado";
    }
  };

  return (
    <Badge variant={getBadgeVariant()} className="text-xs">
      {getBadgeText()}
    </Badge>
  );
}

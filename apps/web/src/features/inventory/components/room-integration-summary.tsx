import { AlertTriangle, CalendarOff, CheckCircle2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type {
  RoomIntegrationSummary as IntegrationSummary,
  Room,
} from "../types";

interface RoomIntegrationSummaryProps {
  room: Room;
  onConnect: (room: Room) => void;
}

function getChannelName(channelType: string) {
  return channelType === "Booking" ? "Booking.com" : "Airbnb";
}

function formatLastSync(date: string) {
  const syncDate = new Date(date);
  const today = new Date();
  const isToday = syncDate.toDateString() === today.toDateString();

  if (isToday) {
    return `Última sync hoje ${syncDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return `Última sync ${syncDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })}`;
}

function getSummary(integrations: IntegrationSummary[]) {
  if (integrations.length === 0) {
    return { text: "Sem sincronização", variant: "outline" as const };
  }

  const failed = integrations.find(
    (integration) => integration.syncStatus.status === "Failed",
  );
  if (failed) {
    return { text: "Erro na sincronização", variant: "destructive" as const };
  }

  const activeIntegrations = integrations.filter(
    (integration) => integration.isActive,
  );
  const latestSync = activeIntegrations
    .map((integration) => integration.syncStatus.lastSyncAt)
    .filter(Boolean)
    .sort()
    .at(-1);

  if (activeIntegrations.length === 1) {
    const channel = getChannelName(activeIntegrations[0].channelType);
    return {
      text: latestSync ? formatLastSync(latestSync) : `${channel} ativo`,
      variant: "secondary" as const,
    };
  }

  if (activeIntegrations.length > 1) {
    return {
      text: latestSync
        ? formatLastSync(latestSync)
        : `${activeIntegrations.length} canais ativos`,
      variant: "secondary" as const,
    };
  }

  return { text: "Sincronização inativa", variant: "outline" as const };
}

export function RoomIntegrationSummary({
  room,
  onConnect,
}: RoomIntegrationSummaryProps) {
  const integrations = room.integrations ?? [];
  const summary = getSummary(integrations);

  if (integrations.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1">
          <CalendarOff className="h-3.5 w-3.5" />
          {summary.text}
        </Badge>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto px-0 text-xs"
          onClick={() => onConnect(room)}
        >
          Conectar
        </Button>
      </div>
    );
  }

  const hasFailure = summary.variant === "destructive";

  return (
    <Badge variant={summary.variant} className="gap-1">
      {hasFailure ? (
        <AlertTriangle className="h-3.5 w-3.5" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5" />
      )}
      {summary.text}
    </Badge>
  );
}

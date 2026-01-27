import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useDeleteIntegration, useSyncIntegration } from "../hooks/use-integrations";
import type { ChannelIntegration } from "../types";
import { SyncStatusBadge } from "./sync-status-badge";

interface IntegrationCardProps {
  integration: ChannelIntegration;
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const syncIntegration = useSyncIntegration();
  const deleteIntegration = useDeleteIntegration();

  const handleSync = () => {
    syncIntegration.mutate(integration.id);
  };

  const handleDelete = () => {
    if (confirm("Deseja realmente remover esta integração?")) {
      deleteIntegration.mutate(integration.id);
    }
  };

  const getChannelName = () => {
    return integration.channelType === "Booking" ? "Booking.com" : "Airbnb";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{getChannelName()}</CardTitle>
            <CardDescription>
              Quarto {integration.roomNumber} - {integration.roomCategoryName}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSync}
              disabled={syncIntegration.isPending || !integration.isActive}
            >
              <RefreshCw
                className={`h-4 w-4 ${syncIntegration.isPending ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={deleteIntegration.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs text-muted-foreground truncate">
          {integration.iCalUrl}
        </div>
        <SyncStatusBadge syncStatus={integration.syncStatus} />
        {!integration.isActive && (
          <div className="text-xs text-yellow-600">Inativo</div>
        )}
      </CardContent>
    </Card>
  );
}

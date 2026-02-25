import { RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { SyncStatusBadge } from "@/features/integrations/components/sync-status-badge";
import type { ChannelIntegration } from "@/features/integrations/types";

interface IntegrationCardProps {
  integration: ChannelIntegration;
  onSync: (integration: ChannelIntegration) => void;
  onDelete: (integration: ChannelIntegration) => void;
  isSyncing?: boolean;
  isDeleting?: boolean;
}

function getChannelName(channelType: string) {
  return channelType === "Booking" ? "Booking.com" : "Airbnb";
}

function getChannelEmoji(channelType: string) {
  return channelType === "Booking" ? "🅱️" : "🏠";
}

export function IntegrationCard({
  integration,
  onSync,
  onDelete,
  isSyncing,
  isDeleting,
}: IntegrationCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <span className="text-xl shrink-0 mt-0.5" aria-hidden>
              {getChannelEmoji(integration.channelType)}
            </span>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">
                  {getChannelName(integration.channelType)}
                </span>
                <Badge
                  variant={integration.isActive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {integration.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {integration.iCalUrl}
              </p>
              <SyncStatusBadge syncStatus={integration.syncStatus} />
            </div>
          </div>

          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onSync(integration)}
              disabled={isSyncing || !integration.isActive}
              title="Sincronizar"
            >
              <RefreshCw
                className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
              />
              <span className="sr-only">Sincronizar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(integration)}
              disabled={isDeleting}
              title="Remover"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remover</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

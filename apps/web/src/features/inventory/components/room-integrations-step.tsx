import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { IntegrationForm } from "@/features/integrations/components/integration-form";
import {
  useCreateIntegration,
  useDeleteIntegration,
  useIntegrations,
  useSyncIntegration,
} from "@/features/integrations/hooks/use-integrations";
import type {
  ChannelIntegration,
  CreateChannelIntegrationRequest,
} from "@/features/integrations/types";
import { IntegrationCard } from "./integration-card";

interface RoomIntegrationsStepProps {
  roomId: string;
}

export function RoomIntegrationsStep({ roomId }: RoomIntegrationsStepProps) {
  const [isAdding, setIsAdding] = useState(false);

  const { data: integrations, isLoading } = useIntegrations();
  const { createIntegration, isPending: isCreating } = useCreateIntegration();
  const { syncIntegration, isPending: isSyncing } = useSyncIntegration();
  const { deleteIntegration, isPending: isDeleting } = useDeleteIntegration();

  const roomIntegrations =
    integrations?.filter((i) => i.roomId === roomId) ?? [];

  const handleCreate = async (data: CreateChannelIntegrationRequest) => {
    await createIntegration(data);
    setIsAdding(false);
  };

  const handleSync = async (integration: ChannelIntegration) => {
    await syncIntegration(integration.id);
  };

  const handleDelete = (integration: ChannelIntegration) => {
    if (confirm("Deseja realmente remover esta integração?")) {
      deleteIntegration(integration.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Integrações iCal</h3>
          <p className="text-xs text-muted-foreground">
            Sincronize reservas de plataformas externas
          </p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm" variant="outline">
            <Plus className="mr-1.5 h-4 w-4" />
            Adicionar
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <IntegrationForm
              onSubmit={handleCreate}
              onCancel={() => setIsAdding(false)}
              isSubmitting={isCreating}
              fixedRoomId={roomId}
              inline
            />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : roomIntegrations.length > 0 ? (
        <div className="space-y-3">
          {roomIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onSync={handleSync}
              onDelete={handleDelete}
              isSyncing={isSyncing}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      ) : (
        !isAdding && (
          <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              Nenhuma integração configurada.
            </p>
            <Button
              onClick={() => setIsAdding(true)}
              size="sm"
              variant="outline"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Criar Primeira Integração
            </Button>
          </div>
        )
      )}
    </div>
  );
}

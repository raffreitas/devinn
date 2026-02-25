import { Plus, Trash2 } from "lucide-react";
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

export interface PendingIntegration {
  id: string;
  channelType: "Booking" | "Airbnb";
  iCalUrl: string;
}

interface RoomIntegrationsStepLocalProps {
  mode: "local";
  pendingIntegrations: PendingIntegration[];
  onAdd: (integration: PendingIntegration) => void;
  onRemove: (id: string) => void;
}

interface RoomIntegrationsStepApiProps {
  mode: "api";
  roomId: string;
}

type RoomIntegrationsStepProps =
  | RoomIntegrationsStepLocalProps
  | RoomIntegrationsStepApiProps;

function getChannelName(channelType: string) {
  return channelType === "Booking" ? "Booking.com" : "Airbnb";
}

function getChannelEmoji(channelType: string) {
  return channelType === "Booking" ? "🅱️" : "🏠";
}

function PendingIntegrationCard({
  integration,
  onRemove,
}: {
  integration: PendingIntegration;
  onRemove: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-xl shrink-0" aria-hidden>
              {getChannelEmoji(integration.channelType)}
            </span>
            <div className="min-w-0 flex-1">
              <span className="font-medium text-sm">
                {getChannelName(integration.channelType)}
              </span>
              <p className="text-xs text-muted-foreground truncate">
                {integration.iCalUrl}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
            onClick={onRemove}
            title="Remover"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function RoomIntegrationsStep(props: RoomIntegrationsStepProps) {
  const [isAdding, setIsAdding] = useState(false);

  if (props.mode === "local") {
    return (
      <LocalMode
        pendingIntegrations={props.pendingIntegrations}
        onAdd={props.onAdd}
        onRemove={props.onRemove}
        isAdding={isAdding}
        setIsAdding={setIsAdding}
      />
    );
  }

  return (
    <ApiMode
      roomId={props.roomId}
      isAdding={isAdding}
      setIsAdding={setIsAdding}
    />
  );
}

function LocalMode({
  pendingIntegrations,
  onAdd,
  onRemove,
  isAdding,
  setIsAdding,
}: {
  pendingIntegrations: PendingIntegration[];
  onAdd: (integration: PendingIntegration) => void;
  onRemove: (id: string) => void;
  isAdding: boolean;
  setIsAdding: (v: boolean) => void;
}) {
  const handleAdd = (data: CreateChannelIntegrationRequest) => {
    onAdd({
      id: crypto.randomUUID(),
      channelType: data.channelType,
      iCalUrl: data.iCalUrl,
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <StepHeader
        count={pendingIntegrations.length}
        isAdding={isAdding}
        onAdd={() => setIsAdding(true)}
      />

      {isAdding && (
        <InlineForm
          onSubmit={handleAdd}
          onCancel={() => setIsAdding(false)}
          fixedRoomId="pending"
        />
      )}

      {pendingIntegrations.length > 0 ? (
        <div className="space-y-3">
          {pendingIntegrations.map((integration) => (
            <PendingIntegrationCard
              key={integration.id}
              integration={integration}
              onRemove={() => onRemove(integration.id)}
            />
          ))}
        </div>
      ) : (
        !isAdding && <EmptyState onAdd={() => setIsAdding(true)} />
      )}
    </div>
  );
}

function ApiMode({
  roomId,
  isAdding,
  setIsAdding,
}: {
  roomId: string;
  isAdding: boolean;
  setIsAdding: (v: boolean) => void;
}) {
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
      <StepHeader
        count={roomIntegrations.length}
        isAdding={isAdding}
        onAdd={() => setIsAdding(true)}
      />

      {isAdding && (
        <InlineForm
          onSubmit={handleCreate}
          onCancel={() => setIsAdding(false)}
          isSubmitting={isCreating}
          fixedRoomId={roomId}
        />
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
        !isAdding && <EmptyState onAdd={() => setIsAdding(true)} />
      )}
    </div>
  );
}

function StepHeader({
  count,
  isAdding,
  onAdd,
}: {
  count: number;
  isAdding: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-sm">
          Integrações iCal
          {count > 0 && (
            <span className="ml-1.5 text-muted-foreground font-normal">
              ({count})
            </span>
          )}
        </h3>
        <p className="text-xs text-muted-foreground">
          Sincronize reservas de plataformas externas
        </p>
      </div>
      {!isAdding && (
        <Button onClick={onAdd} size="sm" variant="outline">
          <Plus className="mr-1.5 h-4 w-4" />
          Adicionar
        </Button>
      )}
    </div>
  );
}

function InlineForm({
  onSubmit,
  onCancel,
  isSubmitting,
  fixedRoomId,
}: {
  onSubmit: (data: CreateChannelIntegrationRequest) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  fixedRoomId: string;
}) {
  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardContent className="p-4">
        <IntegrationForm
          onSubmit={onSubmit}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          fixedRoomId={fixedRoomId}
          inline
        />
      </CardContent>
    </Card>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-lg">
      <p className="text-sm text-muted-foreground mb-3">
        Nenhuma integração configurada.
      </p>
      <Button onClick={onAdd} size="sm" variant="outline">
        <Plus className="mr-1.5 h-4 w-4" />
        Criar Primeira Integração
      </Button>
    </div>
  );
}

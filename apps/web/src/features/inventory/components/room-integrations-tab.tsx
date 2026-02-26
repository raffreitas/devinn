import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { IntegrationForm } from "@/features/integrations/components/integration-form";
import { SyncStatusBadge } from "@/features/integrations/components/sync-status-badge";
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
import { Modal } from "@/shared/components/modal";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { Room } from "../types";
import { ICalExportCard } from "./ical-export-card";

interface RoomIntegrationsTabProps {
  room: Room;
}

export function RoomIntegrationsTab({ room }: RoomIntegrationsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: integrations, isLoading } = useIntegrations();
  const { createIntegration, isPending: createIntegrationIsPending } =
    useCreateIntegration();
  const { syncIntegration, isPending: syncIntegrationIsPending } =
    useSyncIntegration();
  const { deleteIntegration, isPending: deleteIntegrationIsPending } =
    useDeleteIntegration();

  const roomIntegrations =
    integrations?.filter((integration) => integration.roomId === room.id) ?? [];

  const handleCreate = async (data: CreateChannelIntegrationRequest) => {
    await createIntegration(data);
    setIsModalOpen(false);
  };

  const handleSync = async (integration: ChannelIntegration) => {
    await syncIntegration(integration.id);
  };

  const handleDelete = (integration: ChannelIntegration) => {
    if (confirm("Deseja realmente remover esta integração?")) {
      deleteIntegration(integration.id);
    }
  };

  const getChannelName = (channelType: string) => {
    return channelType === "Booking" ? "Booking.com" : "Airbnb";
  };

  return (
    <div className="space-y-6">
      <ICalExportCard
        roomName={room.description || ""}
        roomNumber={room.number}
        iCalExportToken={room.iCalExportToken}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Integrações iCal</h3>
            <p className="text-sm text-muted-foreground">
              Sincronize reservas de plataformas como Booking.com e Airbnb
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nova Integração
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : roomIntegrations.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Canal</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    URL iCal
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Status Sync
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomIntegrations.map((integration) => (
                  <TableRow key={integration.id}>
                    <TableCell className="font-medium">
                      {getChannelName(integration.channelType)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground truncate block max-w-xs">
                        {integration.iCalUrl}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <SyncStatusBadge syncStatus={integration.syncStatus} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={integration.isActive ? "default" : "secondary"}
                      >
                        {integration.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSync(integration)}
                          disabled={
                            syncIntegrationIsPending || !integration.isActive
                          }
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${syncIntegrationIsPending ? "animate-spin" : ""}`}
                          />
                          <span className="sr-only">Sincronizar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(integration)}
                          disabled={deleteIntegrationIsPending}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remover</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg">
            <p className="text-muted-foreground mb-4">
              Nenhuma integração configurada para este quarto.
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Integração
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Integração"
        description="Configure uma nova integração iCal para sincronizar reservas automaticamente."
      >
        <IntegrationForm
          onSubmit={handleCreate}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={createIntegrationIsPending}
        />
      </Modal>
    </div>
  );
}

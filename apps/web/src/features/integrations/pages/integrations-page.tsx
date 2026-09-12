import { Filter, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { AirbnbIcon } from "@/shared/components/icons/airbnb-icon";
import { BookingIcon } from "@/shared/components/icons/booking-icon";
import { LoadingOverlay } from "@/shared/components/loading-overlay";
import { Modal } from "@/shared/components/modal";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { IntegrationForm } from "../components/integration-form";
import { SyncStatusBadge } from "../components/sync-status-badge";
import {
  useCreateIntegration,
  useDeleteIntegration,
  useIntegrations,
  useSyncIntegration,
} from "../hooks/use-integrations";
import type {
  ChannelIntegration,
  CreateChannelIntegrationRequest,
} from "../types";

function getChannelName(channelType: string) {
  return channelType === "Booking" ? "Booking.com" : "Airbnb";
}

function getChannelIcon(channelType: string) {
  return channelType === "Booking" ? <BookingIcon /> : <AirbnbIcon />;
}

function IntegrationListCard({
  integration,
  onSync,
  onDelete,
  isSyncing,
  isDeleting,
}: {
  integration: ChannelIntegration;
  onSync: () => void;
  onDelete: () => void;
  isSyncing: boolean;
  isDeleting: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <span className="text-xl shrink-0 mt-0.5" aria-hidden>
              {getChannelIcon(integration.channelType)}
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
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  Quarto {integration.roomName}
                </span>
                {" · "}
                {integration.roomCategoryName}
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
              onClick={onSync}
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
              onClick={onDelete}
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

export function IntegrationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterRoomId, setFilterRoomId] = useState<string>("all");

  useEffect(() => {
    const roomIdParam = searchParams.get("roomId");
    if (roomIdParam) {
      setFilterRoomId(roomIdParam);
    }
  }, [searchParams]);

  const { data: integrations, isLoading } = useIntegrations();
  const { createIntegration, isPending: createIntegrationIsPending } =
    useCreateIntegration();
  const { syncIntegration, isPending: syncIntegrationIsPending } =
    useSyncIntegration();
  const { deleteIntegration, isPending: deleteIntegrationIsPending } =
    useDeleteIntegration();

  const filteredIntegrations = integrations?.filter((integration) => {
    if (filterRoomId === "all") return true;
    return integration.roomId === filterRoomId;
  });

  const uniqueRooms = integrations?.reduce(
    (acc, integration) => {
      if (!acc.find((r) => r.id === integration.roomId)) {
        acc.push({
          id: integration.roomId,
          number: integration.roomName,
          categoryName: integration.roomCategoryName,
        });
      }
      return acc;
    },
    [] as Array<{ id: string; number: string; categoryName: string }>,
  );

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

  const handleFilterChange = (value: string) => {
    setFilterRoomId(value);
    if (value === "all") {
      searchParams.delete("roomId");
    } else {
      searchParams.set("roomId", value);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-4">
      <LoadingOverlay isFetching={isLoading} position="top-bar" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Integrações
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as integrações iCal para sincronização automática de
            reservas
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Integração
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Integrações Ativas</CardTitle>
              <CardDescription>
                Configure URLs iCal para importar reservas automaticamente
              </CardDescription>
            </div>
            {uniqueRooms && uniqueRooms.length > 0 && (
              <Select value={filterRoomId} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-full md:w-56">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="all">
                    Todos Quartos
                  </SelectItem>
                  {uniqueRooms.map((room) => (
                    <SelectItem
                      className="cursor-pointer"
                      key={room.id}
                      value={room.id}
                    >
                      Quarto {room.number} - {room.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, skeletonId) => skeletonId + 1).map(
                (skeletonId) => (
                  <Skeleton
                    key={skeletonId}
                    className="h-24 w-full rounded-lg"
                  />
                ),
              )}
            </div>
          ) : filteredIntegrations && filteredIntegrations.length > 0 ? (
            <div className="space-y-3">
              {filteredIntegrations.map((integration) => (
                <IntegrationListCard
                  key={integration.id}
                  integration={integration}
                  onSync={() => handleSync(integration)}
                  onDelete={() => handleDelete(integration)}
                  isSyncing={syncIntegrationIsPending}
                  isDeleting={deleteIntegrationIsPending}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Nenhuma integração configurada ainda.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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

import { Filter, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
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
  const createIntegration = useCreateIntegration();
  const syncIntegration = useSyncIntegration();
  const deleteIntegration = useDeleteIntegration();

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
    await createIntegration.mutateAsync(data);
    setIsModalOpen(false);
  };

  const handleSync = (integration: ChannelIntegration) => {
    syncIntegration.mutate(integration.id);
  };

  const handleDelete = (integration: ChannelIntegration) => {
    if (confirm("Deseja realmente remover esta integração?")) {
      deleteIntegration.mutate(integration.id);
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

  const getChannelName = (channelType: string) => {
    return channelType === "Booking" ? "Booking.com" : "Airbnb";
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
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredIntegrations && filteredIntegrations.length > 0 ? (
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Canal</TableHead>
                      <TableHead>Quarto</TableHead>
                      <TableHead className="hidden md:table-cell">
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
                    {filteredIntegrations.map((integration) => (
                      <TableRow key={integration.id}>
                        <TableCell className="font-medium">
                          {getChannelName(integration.channelType)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="font-medium text-sm">
                              {integration.roomName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {integration.roomCategoryName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-xs text-muted-foreground truncate block max-w-xs">
                            {integration.iCalUrl}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <SyncStatusBadge
                            syncStatus={integration.syncStatus}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              integration.isActive ? "default" : "secondary"
                            }
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
                                syncIntegration.isPending ||
                                !integration.isActive
                              }
                            >
                              <RefreshCw
                                className={`h-4 w-4 ${syncIntegration.isPending ? "animate-spin" : ""}`}
                              />
                              <span className="sr-only">Sincronizar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(integration)}
                              disabled={deleteIntegration.isPending}
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
          isSubmitting={createIntegration.isPending}
        />
      </Modal>
    </div>
  );
}

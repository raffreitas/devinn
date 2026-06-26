import {
  CalendarPlus,
  EllipsisVerticalIcon,
  Eye,
  Filter,
  Pencil,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { useSyncIntegration } from "@/features/integrations/hooks/use-integrations";
import { LoadingOverlay } from "@/shared/components/loading-overlay";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";
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
import { usePagination } from "@/shared/hooks/use-pagination";
import { RoomDetailsSheet } from "../components/room-details-sheet";
import { RoomFormSheet } from "../components/room-form-sheet";
import { RoomIntegrationSummary } from "../components/room-integration-summary";
import { statusDisplayConfig } from "../constants/room-status";
import { useRoomCategories, useRooms } from "../hooks";
import type { Room, RoomStatus } from "../types";

type PaginationPage =
  | { type: "page"; value: number }
  | { type: "ellipsis"; key: "start-ellipsis" | "end-ellipsis" };

const ROOM_SKELETON_KEYS = [
  "room-skeleton-1",
  "room-skeleton-2",
  "room-skeleton-3",
  "room-skeleton-4",
  "room-skeleton-5",
];

function generatePaginationPages(currentPage: number, totalPages: number) {
  const pages: PaginationPage[] = [];
  const maxPagesToShow = 5;
  const halfWindow = Math.floor(maxPagesToShow / 2);

  let startPage = Math.max(1, currentPage - halfWindow);
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  if (startPage > 1) {
    pages.push({ type: "page", value: 1 });
    if (startPage > 2) {
      pages.push({ type: "ellipsis", key: "start-ellipsis" });
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push({ type: "page", value: i });
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push({ type: "ellipsis", key: "end-ellipsis" });
    }
    pages.push({ type: "page", value: totalPages });
  }

  return pages;
}

export function RoomsPage() {
  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>();

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<RoomStatus | "all">("all");

  // Gerenciar paginação sincronizada com URL
  const { page, pageSize, goToPage } = usePagination({
    defaultPageSize: 10,
    dependencies: [filterCategory, filterStatus],
  });

  const { data: categories } = useRoomCategories();
  const { data: rooms, isLoading } = useRooms({
    categoryId: filterCategory === "all" ? undefined : filterCategory,
    status: filterStatus === "all" ? undefined : filterStatus,
    page,
    pageSize,
  });
  const { syncIntegration, isPending: isSyncingIntegration } =
    useSyncIntegration();

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setIsFormSheetOpen(true);
  };

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room);
    setIsDetailsSheetOpen(true);
  };

  const handleCreate = () => {
    setSelectedRoom(undefined);
    setIsFormSheetOpen(true);
  };

  const handleCloseFormSheet = () => {
    setIsFormSheetOpen(false);
    setSelectedRoom(undefined);
  };

  const handleCloseDetailsSheet = () => {
    setIsDetailsSheetOpen(false);
    setSelectedRoom(undefined);
  };

  const handleEditFromDetails = (room: Room) => {
    setIsDetailsSheetOpen(false);
    setSelectedRoom(room);
    setIsFormSheetOpen(true);
  };

  const handleManageSync = (room: Room) => {
    setSelectedRoom(room);
    setIsFormSheetOpen(true);
  };

  const handleSyncRoom = async (room: Room) => {
    const activeIntegrations =
      room.integrations?.filter((integration) => integration.isActive) ?? [];

    for (const integration of activeIntegrations) {
      await syncIntegration(integration.id);
    }
  };

  return (
    <div className="space-y-4">
      <LoadingOverlay isFetching={isLoading} position="top-bar" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Quartos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os quartos e acomodações
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Quarto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Lista de Quartos</CardTitle>
              <CardDescription>
                Todos os quartos cadastrados no sistema
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-45">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="all">
                    Todas Categorias
                  </SelectItem>
                  {categories?.map((category) => (
                    <SelectItem
                      className="cursor-pointer"
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterStatus}
                onValueChange={(value) =>
                  setFilterStatus(value as RoomStatus | "all")
                }
              >
                <SelectTrigger className="w-full sm:w-45">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="all">
                    Todos Status
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="Active">
                    Ativo
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="Maintenance">
                    Manutenção
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="Inactive">
                    Inativo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {ROOM_SKELETON_KEYS.map((key) => (
                <Skeleton key={key} className="h-12 w-full" />
              ))}
            </div>
          ) : rooms && rooms.items.length > 0 ? (
            <>
              <div className="overflow-x-auto -mx-6 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Nº</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Integrações
                        </TableHead>
                        <TableHead className="w-10 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rooms.items.map((room) => (
                        <TableRow key={room.id}>
                          <TableCell className="font-medium">
                            {room.number}
                          </TableCell>
                          <TableCell>{room.categoryName}</TableCell>
                          <TableCell>
                            <Badge
                              variant={statusDisplayConfig[room.status].variant}
                            >
                              {statusDisplayConfig[room.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <RoomIntegrationSummary
                              room={room}
                              onConnect={handleManageSync}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <EllipsisVerticalIcon className="h-4 w-4" />
                                  <span className="sr-only">Ações</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewDetails(room)}
                                >
                                  <Eye className="h-4 w-4" />
                                  Ver detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEdit(room)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleManageSync(room)}
                                >
                                  <CalendarPlus className="h-4 w-4" />
                                  {room.integrations &&
                                  room.integrations.length > 0
                                    ? "Gerenciar sincronização"
                                    : "Conectar sincronização"}
                                </DropdownMenuItem>
                                {room.integrations?.some(
                                  (integration) => integration.isActive,
                                ) && (
                                  <DropdownMenuItem
                                    onClick={() => handleSyncRoom(room)}
                                    disabled={isSyncingIntegration}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                    Sincronizar agora
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {/* Pagination */}
              {rooms.totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => page > 1 && goToPage(page - 1)}
                          className={
                            page <= 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                          aria-disabled={page <= 1}
                        />
                      </PaginationItem>

                      {generatePaginationPages(page, rooms.totalPages).map(
                        (pageItem) =>
                          pageItem.type === "ellipsis" ? (
                            <PaginationItem key={pageItem.key}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          ) : (
                            <PaginationItem key={pageItem.value}>
                              <PaginationLink
                                onClick={() => goToPage(pageItem.value)}
                                isActive={pageItem.value === page}
                                className="cursor-pointer"
                              >
                                {pageItem.value}
                              </PaginationLink>
                            </PaginationItem>
                          ),
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            page < rooms.totalPages && goToPage(page + 1)
                          }
                          className={
                            page >= rooms.totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                          aria-disabled={page >= rooms.totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Nenhum quarto cadastrado
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <RoomFormSheet
        isOpen={isFormSheetOpen}
        onClose={handleCloseFormSheet}
        editRoom={selectedRoom}
      />

      <RoomDetailsSheet
        room={selectedRoom}
        isOpen={isDetailsSheetOpen}
        onClose={handleCloseDetailsSheet}
        onEdit={handleEditFromDetails}
      />
    </div>
  );
}

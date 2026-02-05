import { Filter, Eye, Pencil, Plus } from "lucide-react";
import { useState } from "react";
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
import { RoomDetailsModal } from "../components/room-details-modal";
import { RoomForm } from "../components/room-form";
import { statusDisplayConfig } from "../constants/room-status";
import {
  useCreateRoom,
  useRoomCategories,
  useRooms,
  useUpdateRoom,
} from "../hooks";
import type { Room, RoomFormData, RoomStatus } from "../types";

export function RoomsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>();

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<RoomStatus | "all">("all");

  const { data: categories } = useRoomCategories();
  const { data: rooms, isLoading } = useRooms({
    categoryId: filterCategory === "all" ? undefined : filterCategory,
    status: filterStatus === "all" ? undefined : filterStatus,
  });

  const { createRoom, isLoading: isCreating } = useCreateRoom();
  const { updateRoom, isLoading: isUpdating } = useUpdateRoom();

  const handleCreateOrUpdate = (data: RoomFormData) => {
    if (selectedRoom) {
      updateRoom({ id: selectedRoom.id, data });
    } else {
      createRoom(data);
    }
    setIsModalOpen(false);
    setSelectedRoom(undefined);
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room);
    setIsDetailsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedRoom(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(undefined);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRoom(undefined);
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
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : rooms && rooms.items.length > 0 ? (
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
                      <TableHead className="w-25 text-right">Ações</TableHead>
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
                          {room.activeIntegrationsCount &&
                          room.activeIntegrationsCount > 0 ? (
                            <Badge
                              variant="secondary"
                              className="gap-1 cursor-pointer hover:bg-secondary/80"
                            >
                              {room.activeIntegrationsCount}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(room)}
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver detalhes</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(room)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
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
                Nenhum quarto cadastrado
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Novo Quarto"
        description={
          selectedRoom
            ? "Edite os detalhes do quarto."
            : "Preencha os detalhes para criar uma novo quarto."
        }
      >
        <RoomForm
          initialData={selectedRoom}
          onCancel={handleCloseModal}
          onSubmit={handleCreateOrUpdate}
          isSubmitting={isCreating || isUpdating}
        />
      </Modal>

      <RoomDetailsModal
        room={selectedRoom}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
    </div>
  );
}

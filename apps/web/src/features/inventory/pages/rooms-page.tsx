import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Filter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { categoryService } from "../services/category-service";
import { roomService } from "../services/room-service";
import { RoomFormDialog } from "../components/room-form-dialog";
import type { Room, CreateRoomRequest, RoomStatus } from "../types";

const statusConfig: Record<
  RoomStatus,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  Active: { label: "Ativo", variant: "default" },
  Maintenance: { label: "Manutenção", variant: "secondary" },
  Inactive: { label: "Inativo", variant: "destructive" },
};

export function RoomsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>();
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAll,
  });

  const { data: roomsData, isLoading } = useQuery({
    queryKey: ["rooms", filterCategory, filterStatus],
    queryFn: () =>
      roomService.getAll({
        categoryId: filterCategory !== "all" ? filterCategory : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: roomService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Quarto criado com sucesso");
      setDialogOpen(false);
    },
    onError: () => {
      toast.error("Erro ao criar quarto");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateRoomRequest }) =>
      roomService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Quarto atualizado com sucesso");
      setDialogOpen(false);
      setSelectedRoom(undefined);
    },
    onError: () => {
      toast.error("Erro ao atualizar quarto");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: roomService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Quarto excluído com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir quarto");
    },
  });

  const handleSubmit = async (data: CreateRoomRequest) => {
    if (selectedRoom) {
      await updateMutation.mutateAsync({ id: selectedRoom.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este quarto?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleNew = () => {
    setSelectedRoom(undefined);
    setDialogOpen(true);
  };

  console.log(roomsData);


  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Quartos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os quartos e acomodações
          </p>
        </div>
        <Button onClick={handleNew} className="w-full sm:w-auto">
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
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-45">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="Active">Ativo</SelectItem>
                  <SelectItem value="Maintenance">Manutenção</SelectItem>
                  <SelectItem value="Inactive">Inativo</SelectItem>
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
          ) : roomsData && roomsData.items.length > 0 ? (
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Nº</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Capacidade
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Preço Base
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-25 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roomsData.items.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">
                          {room.number}
                        </TableCell>
                        <TableCell>{room.categoryName}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {room.capacity} pessoas
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          R$ {room.basePrice.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[room.status].variant}>
                            {statusConfig[room.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(room)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(room.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
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
              <Button onClick={handleNew}>
                <Plus className="mr-2 h-4 w-4" />
                Criar primeiro quarto
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <RoomFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        room={selectedRoom}
      />
    </div>
  );
}

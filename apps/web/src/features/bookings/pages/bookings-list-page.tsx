import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Eye, Trash2, Filter } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
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
import { useTenant } from "@/shared/contexts/tenant-context";
import { roomService } from "@/features/inventory/services/room-service";
import { bookingService } from "../services/booking-service";
import { BookingFormDialog } from "../components/booking-form-dialog";
import { GuestDetailsPanel } from "../components/guest-details-panel";
import type {
  Booking,
  BookingStatus,
  PaymentStatus,
  CreateBookingRequest,
} from "../types";

const statusConfig: Record<
  BookingStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  Scheduled: { label: "Agendada", variant: "default" },
  CheckedIn: { label: "Hospedando", variant: "secondary" },
  Completed: { label: "Concluída", variant: "outline" },
  Canceled: { label: "Cancelada", variant: "destructive" },
};

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  Paid: { label: "Pago", variant: "default" },
  Partial: { label: "Parcial", variant: "secondary" },
  Pending: { label: "Pendente", variant: "destructive" },
};

export function BookingsListPage() {
  const { innId } = useTenant();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings", innId, filterStatus, filterPaymentStatus],
    queryFn: () => {
      if (!innId) return [];
      return bookingService.getAll({
        status:
          filterStatus !== "all" ? (filterStatus as BookingStatus) : undefined,
        paymentStatus:
          filterPaymentStatus !== "all"
            ? (filterPaymentStatus as PaymentStatus)
            : undefined,
      });
    },
    enabled: !!innId,
  });

  const { data: roomsData } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => roomService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateBookingRequest) => {
      if (!innId) throw new Error("Inn ID não encontrado");
      const room = roomsData?.items.find((r) => r.id === data.roomId);
      if (!room) throw new Error("Quarto não encontrado");

      return bookingService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Reserva criada com sucesso");
      setFormDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar reserva");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return bookingService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Reserva excluída com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir reserva");
    },
  });

  const handleSubmit = async (data: CreateBookingRequest) => {
    await createMutation.mutateAsync(data);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta reserva?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleNew = () => {
    setSelectedBooking(undefined);
    setFormDialogOpen(true);
  };

  if (!innId) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Selecione uma pousada para continuar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Reservas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as reservas da pousada
          </p>
        </div>
        <Button onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nova Reserva
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Lista de Reservas</CardTitle>
              <CardDescription>Todas as reservas cadastradas</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-45">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="hosting">Hospedando</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="Canceled">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterPaymentStatus}
                onValueChange={setFilterPaymentStatus}
              >
                <SelectTrigger className="w-full sm:w-45">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Pagamentos</SelectItem>
                  <SelectItem value="Paid">Pago</SelectItem>
                  <SelectItem value="Partial">Parcial</SelectItem>
                  <SelectItem value="Pending">Pendente</SelectItem>
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
          ) : bookings && bookings.length > 0 ? (
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Quarto</TableHead>
                      <TableHead>Hóspede</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Check-in
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Check-out
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Pagamento
                      </TableHead>
                      <TableHead className="w-30 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.number}
                        </TableCell>
                        <TableCell>{booking.guest.name}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {format(new Date(booking.checkIn), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {format(new Date(booking.checkOut), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[booking.status].variant}>
                            {statusConfig[booking.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            variant={
                              paymentStatusConfig[booking.paymentStatus].variant
                            }
                          >
                            {paymentStatusConfig[booking.paymentStatus].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(booking)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver detalhes</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(booking.id)}
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
                Nenhuma reserva cadastrada
              </p>
              <Button onClick={handleNew}>
                <Plus className="mr-2 h-4 w-4" />
                Criar primeira reserva
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <BookingFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={handleSubmit}
        booking={selectedBooking}
      />

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Reserva</DialogTitle>
          </DialogHeader>
          {selectedBooking && <GuestDetailsPanel booking={selectedBooking} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

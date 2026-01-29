import { format } from "date-fns";
import { EyeIcon, Filter, PenBoxIcon, Plus, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { LoadingOverlay } from "@/shared/components/loading-overlay";
import { Modal } from "@/shared/components/modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { getBlockLabel } from "../utils/booking-helpers";
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
import { BookingDetails } from "../components/booking-details";
import { BookingForm } from "../components/booking-form";
import {
  useBookings,
  useCreateBooking,
  useDeleteBooking,
  useUpdateBooking,
} from "../hooks/use-booking";
import {
  type Booking,
  type BookingFormData,
  type BookingStatus,
  mapToFormData,
  type PaymentStatus,
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

export function BookingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();

  const [filterStatus, setFilterStatus] = useState<BookingStatus | "all">(
    "all",
  );
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<
    PaymentStatus | "all"
  >("all");

  const { data: bookings, isLoading } = useBookings({
    status: filterStatus === "all" ? undefined : filterStatus,
    paymentStatus:
      filterPaymentStatus === "all" ? undefined : filterPaymentStatus,
  });
  const { createBooking, isLoading: isCreating } = useCreateBooking();
  const { updateBooking, isLoading: isUpdating } = useUpdateBooking();
  const { deleteBooking } = useDeleteBooking();

  const handleCreateOrUpdate = async (data: BookingFormData) => {
    const payload = {
      adults: data.adults,
      children: data.children,
      childrenAges: data.childrenAges?.map((e) => e.age),
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guest: {
        name: data.guestName,
        email: data.guestEmail,
        phone: data.guestPhone,
        document: data.guestDocument,
        birthDate: data.guestBirthDate,
      },
      roomId: data.roomId,
      notes: data.notes,
      paidAmount: data.paidAmount,
      paymentMethod: data.paymentMethod,
      paymentNotes: data.paymentNotes,
    };

    if (selectedBooking) {
      await updateBooking({ id: selectedBooking.id, data: payload });
    } else {
      await createBooking(payload);
    }
    setIsModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedBooking(undefined);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };
  const handleCreate = () => {
    setSelectedBooking(undefined);
    setIsModalOpen(true);
  };
  const handleDelete = async (id: string) => {
    await deleteBooking(id);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedBooking(undefined);
  };

  return (
    <div className="space-y-4">
      <LoadingOverlay isFetching={isLoading} position="top-bar" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Reservas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as reservas da pousada
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
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
              <Select
                value={filterStatus}
                onValueChange={(v) =>
                  setFilterStatus(v as BookingStatus | "all")
                }
              >
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
                onValueChange={(v) =>
                  setFilterPaymentStatus(v as PaymentStatus | "all")
                }
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
                        <TableCell>{booking.guest?.name || getBlockLabel(booking.source)}</TableCell>
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
                              <EyeIcon className="h-4 w-4" />
                              <span className="sr-only">Ver detalhes</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(booking)}
                            >
                              <PenBoxIcon className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2Icon className="h-4 w-4" />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Tem certeza que deseja excluir esta reserva?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Essa ação não pode ser desfeita. Isso
                                  excluirá permanentemente a reserva.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(booking.id)}
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedBooking ? "Editar Reserva" : "Nova Reserva"}
        description={
          selectedBooking
            ? "Edite os detalhes da reserva."
            : "Preencha os detalhes para criar uma nova reserva."
        }
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <BookingForm
          initialData={
            selectedBooking ? mapToFormData(selectedBooking) : undefined
          }
          onCancel={handleCloseModal}
          onSubmit={handleCreateOrUpdate}
          isSubmitting={isCreating || isUpdating}
        />
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModal}
        title="Detalhes da Reserva"
        description="Visualize as informações completas da reserva."
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        {selectedBooking && (
          <BookingDetails
            booking={selectedBooking}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Modal>
    </div>
  );
}

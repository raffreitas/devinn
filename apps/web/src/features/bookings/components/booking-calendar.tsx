import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRooms } from "@/features/inventory/hooks";
import { Modal } from "@/shared/components/modal";
import { removeChars } from "@/shared/lib/utils";
import {
  useBookings,
  useDeleteBooking,
  useUpdateBookingReconciliationStatus,
} from "../hooks/use-booking";
import { bookingService } from "../services/booking-service";
import {
  type Booking,
  type BookingFormData,
  type CreateBookingRequest,
  mapToFormData,
  type UpdateBookingRequest,
} from "../types";
import { isBlock, isICalSource } from "../utils/booking-helpers";
import { BookingDetails } from "./booking-details";
import { BookingForm } from "./booking-form";
import { CalendarGrid } from "./calendar-grid";
import { CalendarToolbar, type ViewMode } from "./calendar-toolbar";

function computeDays(date: Date, viewMode: ViewMode): Date[] {
  if (viewMode === "month") {
    return eachDayOfInterval({
      start: startOfMonth(date),
      end: endOfMonth(date),
    });
  }
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
}

export function BookingCalendar() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [preselectedRoom, setPreselectedRoom] = useState<string | undefined>();
  const [preselectedDate, setPreselectedDate] = useState<Date | undefined>();
  const [editingBooking, setEditingBooking] = useState<Booking | undefined>();
  const [detailsBooking, setDetailsBooking] = useState<Booking | undefined>();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const days = computeDays(currentDate, viewMode);
  const startDate = format(days[0], "yyyy-MM-dd");
  const endDate = format(days[days.length - 1], "yyyy-MM-dd");

  const { data: roomsData } = useRooms({ pageSize: 100 });
  const { data: bookings, refetch } = useBookings({
    startDate,
    endDate,
    pageSize: 200,
  });
  const { deleteBooking } = useDeleteBooking();
  const { ignoreExternalBlock, isLoading: isIgnoringExternalBlock } =
    useUpdateBookingReconciliationStatus();

  const handleNavigatePrev = () => {
    if (viewMode === "month") {
      setCurrentDate((prev) => subMonths(prev, 1));
    } else {
      setCurrentDate((prev) => subWeeks(prev, 1));
    }
  };

  const handleNavigateNext = () => {
    if (viewMode === "month") {
      setCurrentDate((prev) => addMonths(prev, 1));
    } else {
      setCurrentDate((prev) => addWeeks(prev, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setCurrentDate(new Date());
  };

  const handleCellClick = (roomId: string, date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      toast.error("Não é possível criar reservas em datas passadas");
      return;
    }
    setPreselectedRoom(roomId);
    setPreselectedDate(date);
    setFormDialogOpen(true);
  };

  const handleBookingClick = (booking: Booking) => {
    setDetailsBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleBookingEdit = (booking: Booking) => {
    setIsDetailsModalOpen(false);
    setDetailsBooking(undefined);
    setEditingBooking(booking);
    setPreselectedRoom(booking.roomId);
    setPreselectedDate(new Date(booking.checkIn));
    setFormDialogOpen(true);
  };

  const handleFormSubmit = (data: BookingFormData) => {
    const payload = {
      adults: data.adults,
      children: data.children,
      childrenAges: data.childrenAges?.map((e) => e.age),
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guest: {
        name: data.guestName,
        email: data.guestEmail,
        phone: removeChars(data.guestPhone ?? ""),
        document: removeChars(data.guestDocument ?? ""),
        birthDate: data.guestBirthDate,
      },
      roomId: data.roomId,
      notes: data.notes,
      paidAmount: data.paidAmount,
      paymentMethod: data.paymentMethod,
      paymentNotes: data.paymentNotes,
    };
    if (editingBooking) {
      handleUpdate(editingBooking.id, payload);
    } else {
      handleCreate(payload);
    }
  };

  const handleCreate = async (data: CreateBookingRequest) => {
    const room = roomsData?.items.find((r) => r.id === data.roomId);
    if (!room) {
      toast.error("Quarto não encontrado");
      return;
    }
    try {
      await bookingService.create(data);
      toast.success("Reserva criada com sucesso");
      setFormDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error((error as Error).message || "Erro ao criar reserva");
    }
  };

  const handleUpdate = async (id: string, data: UpdateBookingRequest) => {
    try {
      await bookingService.update(id, data);
      toast.success("Reserva atualizada com sucesso");
      setFormDialogOpen(false);
      setEditingBooking(undefined);
      refetch();
    } catch (error) {
      toast.error((error as Error).message || "Erro ao atualizar reserva");
    }
  };

  const handleCancel = () => {
    setFormDialogOpen(false);
    setEditingBooking(undefined);
    setPreselectedRoom(undefined);
    setPreselectedDate(undefined);
  };

  const handleDeleteFromDetails = (id: string) => {
    deleteBooking(id);
    setIsDetailsModalOpen(false);
  };

  const handleIgnoreExternalBlock = async (id: string) => {
    await ignoreExternalBlock({ id });
    setIsDetailsModalOpen(false);
    setDetailsBooking(undefined);
    refetch();
  };

  const activeRooms =
    roomsData?.items.filter((room) => room.status === "Active") || [];

  // Scroll to center "today" column whenever the visible days change
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const today = new Date();
    const todayIsInView = days.some(
      (d) =>
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate(),
    );
    const todayEl = todayIsInView
      ? container.querySelector<HTMLElement>("[data-today]")
      : null;
    if (!todayEl) {
      container.scrollTo({ left: 0 });
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const elRect = todayEl.getBoundingClientRect();
    const newScrollLeft =
      container.scrollLeft +
      elRect.left -
      containerRect.left -
      (containerRect.width - elRect.width) / 2;
    container.scrollTo({
      left: Math.max(0, newScrollLeft),
      behavior: "smooth",
    });
  }, [days]);

  return (
    <div className="space-y-4">
      <CalendarToolbar
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
        onToday={handleToday}
        onCreateBooking={() => {
          setEditingBooking(undefined);
          setPreselectedRoom(undefined);
          setPreselectedDate(undefined);
          setFormDialogOpen(true);
        }}
      />

      <CalendarGrid
        days={days}
        rooms={activeRooms}
        bookings={bookings?.items ?? []}
        scrollContainerRef={scrollContainerRef}
        onCellClick={handleCellClick}
        onBookingClick={handleBookingClick}
        onBookingEdit={handleBookingEdit}
      />

      <Modal
        isOpen={formDialogOpen}
        onClose={handleCancel}
        title={editingBooking ? "Editar Reserva" : "Nova Reserva"}
        description={
          editingBooking
            ? "Atualize os detalhes da reserva."
            : "Preencha os detalhes para criar uma nova reserva."
        }
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <BookingForm
          initialData={mapToFormData(editingBooking)}
          preSelectedRoom={preselectedRoom}
          preSelectedDate={preselectedDate}
          onCancel={handleCancel}
          onSubmit={handleFormSubmit}
          isSubmitting={false}
          isICalBlock={
            editingBooking
              ? isBlock(editingBooking) && isICalSource(editingBooking.source)
              : false
          }
        />
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setDetailsBooking(undefined);
        }}
        title="Detalhes da Reserva"
        description="Visualize as informações completas da reserva."
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        {detailsBooking && (
          <BookingDetails
            booking={detailsBooking}
            onEdit={handleBookingEdit}
            onDelete={handleDeleteFromDetails}
            onIgnoreExternalBlock={handleIgnoreExternalBlock}
            isIgnoringExternalBlock={isIgnoringExternalBlock}
          />
        )}
      </Modal>
    </div>
  );
}

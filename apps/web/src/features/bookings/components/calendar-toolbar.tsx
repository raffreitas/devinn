import { addDays, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export type ViewMode = "week" | "month";

interface CalendarToolbarProps {
  currentDate: Date;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onToday: () => void;
  onCreateBooking: () => void;
}

function getPeriodLabel(date: Date, viewMode: ViewMode): string {
  if (viewMode === "month") {
    return format(date, "MMMM yyyy", { locale: ptBR });
  }
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${format(weekStart, "d")}-${format(weekEnd, "d 'de' MMMM yyyy", { locale: ptBR })}`;
  }
  return `${format(weekStart, "d MMM", { locale: ptBR })} - ${format(weekEnd, "d MMM yyyy", { locale: ptBR })}`;
}

export function CalendarToolbar({
  currentDate,
  viewMode,
  onViewModeChange,
  onNavigatePrev,
  onNavigateNext,
  onToday,
  onCreateBooking,
}: CalendarToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Reservas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visualize e gerencie as reservas da sua pousada em um calendário
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* View mode toggle */}
        <div className="flex rounded-md border border-border overflow-hidden">
          <button
            type="button"
            className={cn(
              "px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "week"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground",
            )}
            onClick={() => onViewModeChange("week")}
          >
            Semana
          </button>
          <button
            type="button"
            className={cn(
              "px-3 py-1.5 text-sm font-medium border-l border-border transition-colors",
              viewMode === "month"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground",
            )}
            onClick={() => onViewModeChange("month")}
          >
            Mês
          </button>
        </div>

        {/* Period navigation */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={onNavigatePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={onToday}
            className="min-w-36 capitalize"
          >
            {getPeriodLabel(currentDate, viewMode)}
          </Button>
          <Button variant="outline" size="icon" onClick={onNavigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={onCreateBooking}>
          <Plus className="h-4 w-4 mr-1" />
          Nova Reserva
        </Button>
      </div>
    </div>
  );
}

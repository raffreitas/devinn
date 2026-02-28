import { Pencil } from "lucide-react";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { statusDisplayConfig } from "../constants/room-status";
import type { Room } from "../types";
import { ICalExportCard } from "./ical-export-card";
import { RoomIntegrationsStep } from "./room-integrations-step";

interface RoomDetailsSheetProps {
  room: Room | undefined;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (room: Room) => void;
}

export function RoomDetailsSheet({
  room,
  isOpen,
  onClose,
  onEdit,
}: RoomDetailsSheetProps) {
  if (!room) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Quarto {room.number}</SheetTitle>
          <SheetDescription>
            Informações e integrações do quarto
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          {/* Room Info Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Informações</CardTitle>
                  <CardDescription>Detalhes gerais do quarto</CardDescription>
                </div>
                <Button
                  onClick={() => onEdit(room)}
                  size="sm"
                  variant="outline"
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Número
                  </p>
                  <p className="font-semibold">{room.number}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Categoria
                  </p>
                  <p className="font-semibold">{room.categoryName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Capacidade
                  </p>
                  <p className="font-semibold">{room.capacity} pessoas</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Preço Base
                  </p>
                  <p className="font-semibold">
                    R$ {room.basePrice.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Preço Extra
                  </p>
                  <p className="font-semibold">
                    R$ {room.extraGuestPrice.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Status
                  </p>
                  <Badge variant={statusDisplayConfig[room.status].variant}>
                    {statusDisplayConfig[room.status].label}
                  </Badge>
                </div>
                {room.description && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">
                      Descrição
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {room.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* iCal Export Section */}
          <ICalExportCard
            roomName={room.description || ""}
            roomNumber={room.number}
            iCalExportToken={room.iCalExportToken}
          />

          {/* Integrations Section */}
          <RoomIntegrationsStep mode="api" roomId={room.id} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

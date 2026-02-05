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
import { statusDisplayConfig } from "../constants/room-status";
import type { Room } from "../types";

interface RoomDetailsTabProps {
  room: Room;
  onEdit: () => void;
}

export function RoomDetailsTab({ room, onEdit }: RoomDetailsTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Informações do Quarto</CardTitle>
              <CardDescription>Detalhes gerais do quarto</CardDescription>
            </div>
            <Button onClick={onEdit} size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Número do Quarto
              </p>
              <p className="text-lg font-semibold">{room.number}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Categoria
              </p>
              <p className="text-lg font-semibold">{room.categoryName}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Capacidade
              </p>
              <p className="text-lg font-semibold">{room.capacity} pessoas</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Preço Base
              </p>
              <p className="text-lg font-semibold">
                R$ {room.basePrice.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Preço Extra por Hóspede
              </p>
              <p className="text-lg font-semibold">
                R$ {room.extraGuestPrice.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Status
              </p>
              <Badge variant={statusDisplayConfig[room.status].variant}>
                {statusDisplayConfig[room.status].label}
              </Badge>
            </div>

            {room.description && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground mb-2">
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
    </div>
  );
}

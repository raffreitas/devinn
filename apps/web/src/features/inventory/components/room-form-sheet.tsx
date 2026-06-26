import { CalendarSync } from "lucide-react";
import { useRef, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { useCreateRoom, useUpdateRoom } from "../hooks";
import type { Room } from "../types";
import { ICalExportCard } from "./ical-export-card";
import { RoomForm, type RoomFormRef } from "./room-form";
import {
  type PendingIntegration,
  RoomIntegrationsStep,
} from "./room-integrations-step";

interface RoomFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  editRoom?: Room;
}

export function RoomFormSheet({
  isOpen,
  onClose,
  editRoom,
}: RoomFormSheetProps) {
  const [pendingIntegrations, setPendingIntegrations] = useState<
    PendingIntegration[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const roomFormRef = useRef<RoomFormRef>(null);

  const { createRoom } = useCreateRoom();
  const { updateRoom } = useUpdateRoom();

  const isEditMode = !!editRoom;

  const handleClose = () => {
    setPendingIntegrations([]);
    setIsSaving(false);
    onClose();
  };

  const handleAddPending = (integration: PendingIntegration) => {
    setPendingIntegrations((prev) => [...prev, integration]);
  };

  const handleRemovePending = (id: string) => {
    setPendingIntegrations((prev) => prev.filter((i) => i.id !== id));
  };

  const handleFinish = async () => {
    const data = await roomFormRef.current?.validate();
    if (!data) return;

    setIsSaving(true);
    try {
      if (isEditMode && editRoom) {
        await updateRoom({ id: editRoom.id, data });
      } else {
        await createRoom({
          ...data,
          integrations: pendingIntegrations.map((i) => ({
            channelType: i.channelType,
            iCalUrl: i.iCalUrl,
          })),
        });
      }
      handleClose();
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {isEditMode ? `Editar Quarto ${editRoom.number}` : "Novo Quarto"}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Atualize os dados e gerencie a sincronização do quarto."
              : "Cadastre o quarto e conecte calendários externos agora ou depois."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8">
          <section className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm">Dados do quarto</h3>
              <p className="text-xs text-muted-foreground">
                Informe a categoria, número e status operacional.
              </p>
            </div>
            <RoomForm
              ref={roomFormRef}
              initialData={editRoom}
              onSubmit={() => {}}
              showActions={false}
            />
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm">Sincronização</h3>
              <p className="text-xs text-muted-foreground">
                Receba reservas de canais externos e envie a disponibilidade do
                DevInn para outros sistemas.
              </p>
            </div>

            {isEditMode ? (
              <RoomIntegrationsStep mode="api" roomId={editRoom.id} />
            ) : (
              <RoomIntegrationsStep
                mode="local"
                pendingIntegrations={pendingIntegrations}
                onAdd={handleAddPending}
                onRemove={handleRemovePending}
              />
            )}

            {isEditMode ? (
              <ICalExportCard
                roomName={editRoom.description || ""}
                roomNumber={editRoom.number}
                iCalExportToken={editRoom.iCalExportToken}
              />
            ) : (
              <Alert>
                <CalendarSync />
                <AlertTitle>Enviar disponibilidade</AlertTitle>
                <AlertDescription>
                  Após salvar o quarto, o DevInn gera um link iCal para copiar
                  em Booking.com, Airbnb ou outro calendário externo.
                </AlertDescription>
              </Alert>
            )}
          </section>
        </div>

        <SheetFooter className="border-t pt-4">
          <div className="flex w-full gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleFinish}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? "Salvando..." : "Salvar quarto"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

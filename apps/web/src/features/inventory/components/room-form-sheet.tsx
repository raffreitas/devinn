import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
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
import type { Room, RoomFormData } from "../types";
import { RoomForm, type RoomFormRef } from "./room-form";
import {
  type PendingIntegration,
  RoomIntegrationsStep,
} from "./room-integrations-step";
import { RoomStepper } from "./room-stepper";

const STEPS = [
  { id: "room-data", label: "Dados do Quarto" },
  { id: "integrations", label: "Integrações" },
];

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
  const [currentStep, setCurrentStep] = useState(0);
  const [roomFormData, setRoomFormData] = useState<RoomFormData | null>(null);
  const [pendingIntegrations, setPendingIntegrations] = useState<
    PendingIntegration[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const roomFormRef = useRef<RoomFormRef>(null);

  const { createRoom } = useCreateRoom();
  const { updateRoom } = useUpdateRoom();

  const isEditMode = !!editRoom;

  const handleClose = () => {
    setCurrentStep(0);
    setRoomFormData(null);
    setPendingIntegrations([]);
    setIsSaving(false);
    onClose();
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      const data = await roomFormRef.current?.validate();
      if (!data) return;
      setRoomFormData(data);
      setCurrentStep(1);
    }
  };

  const handleStepClick = (index: number) => {
    if (index === 0) {
      setCurrentStep(0);
    }
    if (index === 1 && roomFormData) {
      setCurrentStep(1);
    }
  };

  const handleAddPending = (integration: PendingIntegration) => {
    setPendingIntegrations((prev) => [...prev, integration]);
  };

  const handleRemovePending = (id: string) => {
    setPendingIntegrations((prev) => prev.filter((i) => i.id !== id));
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      if (isEditMode && editRoom) {
        // Edit mode: update room, integrations are managed via API mode
        if (roomFormData) {
          await updateRoom({ id: editRoom.id, data: roomFormData });
        }
      } else if (roomFormData) {
        // Create mode: create room with all pending integrations in a single request
        await createRoom({
          ...roomFormData,
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
              ? "Atualize os dados e integrações do quarto"
              : "Preencha os dados e configure integrações"}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
          <RoomStepper
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {currentStep === 0 && (
            <RoomForm
              ref={roomFormRef}
              initialData={editRoom || (roomFormData ?? undefined)}
              onSubmit={() => {}}
              showActions={false}
            />
          )}

          {currentStep === 1 &&
            (isEditMode ? (
              <RoomIntegrationsStep mode="api" roomId={editRoom.id} />
            ) : (
              <RoomIntegrationsStep
                mode="local"
                pendingIntegrations={pendingIntegrations}
                onAdd={handleAddPending}
                onRemove={handleRemovePending}
              />
            ))}
        </div>

        <SheetFooter className="border-t pt-4">
          <div className="flex w-full gap-2">
            {currentStep === 0 ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="button" onClick={handleNext} className="flex-1">
                  Próximo
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(0)}
                  className="flex-1"
                >
                  <ChevronLeft className="mr-1.5 h-4 w-4" />
                  Voltar
                </Button>
                <Button
                  type="button"
                  onClick={handleFinish}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? "Salvando..." : "Concluir"}
                </Button>
              </>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

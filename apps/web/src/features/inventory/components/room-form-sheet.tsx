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
import { RoomIntegrationsStep } from "./room-integrations-step";
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
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const roomFormRef = useRef<RoomFormRef>(null);

  const { createRoom, isLoading: isCreating } = useCreateRoom();
  const { updateRoom, isLoading: isUpdating } = useUpdateRoom();

  const isEditMode = !!editRoom;
  const roomId = editRoom?.id || createdRoomId;

  const handleClose = () => {
    setCurrentStep(0);
    setCreatedRoomId(null);
    onClose();
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      const success = await roomFormRef.current?.submit();
      if (!success) return;
    }
  };

  const handleRoomSubmit = async (data: RoomFormData) => {
    if (isEditMode && editRoom) {
      await updateRoom({ id: editRoom.id, data });
      setCurrentStep(1);
    } else {
      const room = await createRoom(data);
      setCreatedRoomId(room.id);
      setCurrentStep(1);
    }
  };

  const handleStepClick = (index: number) => {
    if (index < currentStep || (index === 1 && roomId)) {
      setCurrentStep(index);
    }
  };

  const handleFinish = () => {
    handleClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col"
      >
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
              initialData={editRoom}
              onSubmit={handleRoomSubmit}
              showActions={false}
            />
          )}

          {currentStep === 1 && roomId && (
            <RoomIntegrationsStep roomId={roomId} />
          )}
        </div>

        <SheetFooter className="border-t pt-4">
          <div className="flex w-full gap-2">
            {currentStep === 0 ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isCreating || isUpdating}
                  className="flex-1"
                >
                  {isCreating || isUpdating ? (
                    "Salvando..."
                  ) : (
                    <>
                      Próximo
                      <ChevronRight className="ml-1.5 h-4 w-4" />
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(0)}
                  className="flex-1"
                >
                  <ChevronLeft className="mr-1.5 h-4 w-4" />
                  Voltar
                </Button>
                <Button onClick={handleFinish} className="flex-1">
                  Concluir
                </Button>
              </>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

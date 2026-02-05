import { useEffect, useState } from "react";
import { Modal } from "@/shared/components/modal";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { useUpdateRoom } from "../hooks";
import type { Room, RoomFormData } from "../types";
import { RoomDetailsTab } from "./room-details-tab";
import { RoomForm } from "./room-form";
import { RoomIntegrationsTab } from "./room-integrations-tab";

interface RoomDetailsModalProps {
  room: Room | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export function RoomDetailsModal({
  room,
  isOpen,
  onClose,
}: RoomDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const { updateRoom, isLoading: isUpdating } = useUpdateRoom();

  // Persist tab preference in localStorage
  useEffect(() => {
    if (isOpen) {
      const savedTab = localStorage.getItem("roomDetailsModalTab");
      setActiveTab(savedTab || "details");
    }
  }, [isOpen]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem("roomDetailsModalTab", tab);
  };

  const handleEditRoom = async (data: RoomFormData) => {
    if (room) {
      await updateRoom({ id: room.id, data });
      setIsEditingRoom(false);
    }
  };

  if (!room) return null;

  if (isEditingRoom) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Editar Quarto ${room.number}`}
        description="Atualize os detalhes do quarto"
        className="max-w-svw"
      >
        <RoomForm
          initialData={room}
          onCancel={() => setIsEditingRoom(false)}
          onSubmit={handleEditRoom}
          isSubmitting={isUpdating}
        />
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Quarto ${room.number}`}
      description="Gerencie informações e integrações do quarto"
      className="w-full sm:max-w-5xl"
    >
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6 space-y-4">
          <RoomDetailsTab room={room} onEdit={() => setIsEditingRoom(true)} />
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <RoomIntegrationsTab room={room} />
        </TabsContent>
      </Tabs>
    </Modal>
  );
}

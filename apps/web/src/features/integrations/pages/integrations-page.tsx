import { Plus } from "lucide-react";
import { useState } from "react";
import { LoadingOverlay } from "@/shared/components/loading-overlay";
import { Modal } from "@/shared/components/modal";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { IntegrationForm } from "../components/integration-form";
import { IntegrationsList } from "../components/integrations-list";
import { useCreateIntegration, useIntegrations } from "../hooks/use-integrations";
import type { CreateChannelIntegrationRequest } from "../types";

export function IntegrationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: integrations, isLoading } = useIntegrations();
  const createIntegration = useCreateIntegration();

  const handleCreate = async (data: CreateChannelIntegrationRequest) => {
    await createIntegration.mutateAsync(data);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <LoadingOverlay isFetching={isLoading} position="top-bar" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Integrações
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as integrações iCal para sincronização automática de
            reservas
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Integração
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integrações Ativas</CardTitle>
          <CardDescription>
            Configure URLs iCal do Booking.com e Airbnb para importar reservas
            automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {integrations && <IntegrationsList integrations={integrations} />}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Integração"
        description="Configure uma nova integração iCal para sincronizar reservas automaticamente."
      >
        <IntegrationForm
          onSubmit={handleCreate}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={createIntegration.isPending}
        />
      </Modal>
    </div>
  );
}

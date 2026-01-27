import { IntegrationCard } from "./integration-card";
import type { ChannelIntegration } from "../types";

interface IntegrationsListProps {
  integrations: ChannelIntegration[];
}

export function IntegrationsList({ integrations }: IntegrationsListProps) {
  if (integrations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Nenhuma integração configurada ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {integrations.map((integration) => (
        <IntegrationCard key={integration.id} integration={integration} />
      ))}
    </div>
  );
}

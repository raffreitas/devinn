import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { financialDashboardService } from "../services/financial-dashboard-service";

export function useFinancialDashboard(referenceDate?: string) {
  const { innId } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["financial-dashboard", innId, referenceDate],
    queryFn: () => financialDashboardService.getMetrics(referenceDate),
    enabled: !!innId,
    staleTime: 30_000,
  });

  return {
    metrics: data,
    isLoading,
    refetch,
  };
}

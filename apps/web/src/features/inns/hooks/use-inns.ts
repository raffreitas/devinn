import { useQuery } from "@tanstack/react-query";
import { tenantService } from "../services/inn-service";

export function useInns() {
  const { data, isLoading } = useQuery({
    queryKey: ["inns"],
    queryFn: tenantService.listInns,
  });

  return {
    data: data,
    isLoading: isLoading,
  };
}

export function useInn(id: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["inn", id],
    queryFn: () => {
      return tenantService.getInnById(id);
    },
    enabled: !!id,
  });

  return {
    data: data,
    isLoading: isLoading,
  };
}

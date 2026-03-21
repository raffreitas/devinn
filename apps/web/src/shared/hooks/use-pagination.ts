import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";

interface UsePaginationOptions {
  defaultPageSize?: number;
  dependencies?: (string | number | boolean | undefined)[];
}

/**
 * Hook para gerenciar paginação sincronizada com URL
 * Sincroniza automaticamente com query params: ?page=X&pageSize=Y
 *
 * @example
 * const { page, pageSize, totalPages, goToPage, setPageSize } = usePagination(
 *   { defaultPageSize: 20, dependencies: [categoryId, status] }
 * );
 */
export function usePagination({
  defaultPageSize = 20,
  dependencies = [],
}: UsePaginationOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Ler query params da URL
  const page = useMemo(() => {
    const param = searchParams.get("page");
    return param ? Math.max(1, parseInt(param, 10)) : 1;
  }, [searchParams]);

  const pageSize = useMemo(() => {
    const param = searchParams.get("pageSize");
    return param ? Math.max(1, parseInt(param, 10)) : defaultPageSize;
  }, [searchParams, defaultPageSize]);

  // Resetar para página 1 quando dependências mudam
  // (ex: quando muda um filtro)
  useEffect(() => {
    const currentPage = searchParams.get("page");
    if (currentPage !== "1" && currentPage !== null) {
      // Se não estamos já na página 1, ir para lá
      setSearchParams(
        (prev) => {
          prev.set("page", "1");
          return prev;
        },
        { replace: true },
      );
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> As dependências do useEffect devem incluir apenas as variáveis que, quando mudadas, devem resetar a página para 1. Incluir `searchParams` ou `setSearchParams` causaria reexecuções desnecessárias do efeito, já que eles são estáveis e não mudam entre renderizações. O objetivo é que o efeito seja acionado apenas quando as dependências relevantes (como filtros) mudarem, e não por mudanças na própria paginação. Portanto, intencionalmente deixamos as dependências vazias para garantir que este efeito seja executado apenas quando as dependências fornecidas mudarem.
  }, dependencies);

  // Navegar para uma página específica
  const goToPage = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set("page", Math.max(1, newPage).toString());
      return prev;
    });

    // Scroll para o topo da página
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Mudar o tamanho da página
  const setPageSizeValue = (newPageSize: number) => {
    setSearchParams((prev) => {
      prev.set("pageSize", Math.max(1, newPageSize).toString());
      prev.set("page", "1"); // Resetar para página 1
      return prev;
    });
  };

  return {
    page,
    pageSize,
    goToPage,
    setPageSize: setPageSizeValue,
  };
}

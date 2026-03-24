import { AlertCircle, Home, RefreshCcw } from "lucide-react";
import type { ErrorInfo, ReactNode } from "react";
import { Component, useEffect } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { logApplicationError } from "@/shared/lib/error-monitoring";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

type ErrorFallbackContentProps = {
  title: string;
  message: string;
  details?: string;
  onTryAgain?: () => void;
};

type ErrorFallbackState = {
  title: string;
  message: string;
  details?: string;
};

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (isRouteErrorResponse(error)) {
    if (typeof error.data === "string") {
      return error.data;
    }

    return `${error.status} ${error.statusText}`.trim();
  }

  return undefined;
}

function resolveErrorContent(error: unknown): ErrorFallbackState {
  const details = getErrorDetails(error);

  if (isRouteErrorResponse(error)) {
    if (error.status === 401 || error.status === 403) {
      return {
        title: "Acesso indisponivel",
        message:
          "Voce nao tem permissao para acessar este conteudo agora. Recarregue a pagina ou volte para o inicio.",
        details,
      };
    }

    if (error.status === 404) {
      return {
        title: "Conteudo nao encontrado",
        message:
          "Nao conseguimos encontrar a pagina ou os dados solicitados. Voce pode voltar ao inicio e continuar navegando.",
        details,
      };
    }

    return {
      title: "Nao foi possivel carregar esta tela",
      message:
        "Encontramos um problema ao abrir este conteudo. Tente recarregar a pagina em alguns instantes.",
      details,
    };
  }

  if (
    error instanceof Error &&
    (error.message.includes("Failed to fetch dynamically imported module") ||
      error.message.includes("Importing a module script failed"))
  ) {
    return {
      title: "Falha ao carregar a aplicacao",
      message:
        "Alguns arquivos da aplicacao nao puderam ser carregados. Verifique sua conexao e tente recarregar a pagina.",
      details,
    };
  }

  return {
    title: "Algo saiu do esperado",
    message:
      "Encontramos um erro inesperado e registramos o ocorrido. Recarregue a pagina para tentar continuar.",
    details,
  };
}

function ErrorFallbackContent({
  title,
  message,
  details,
  onTryAgain,
}: ErrorFallbackContentProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl items-center justify-center">
        <Card className="w-full border-border/60 shadow-xl">
          <CardHeader className="items-center text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-8" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl">{title}</CardTitle>
            <CardDescription className="max-w-xl text-sm sm:text-base">
              {message}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="size-4" />
              <AlertTitle>O que voce pode fazer agora</AlertTitle>
              <AlertDescription>
                <p>Recarregue a pagina para tentar novamente.</p>
                <p>
                  Se o problema continuar, volte ao inicio e refaca a ultima
                  acao.
                </p>
              </AlertDescription>
            </Alert>

            {import.meta.env.DEV && details ? (
              <details className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                <summary className="cursor-pointer font-medium text-foreground">
                  Detalhes tecnicos
                </summary>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">
                  {details}
                </pre>
              </details>
            ) : null}
          </CardContent>

          <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            {onTryAgain ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onTryAgain}
              >
                <RefreshCcw className="size-4" />
                Tentar novamente
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => window.location.assign("/")}
            >
              <Home className="size-4" />
              Ir para o inicio
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw className="size-4" />
              Recarregar pagina
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  override state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logApplicationError(error, errorInfo, {
      source: "app-error-boundary",
    });
  }

  private handleTryAgain = () => {
    this.setState({ error: null });
  };

  override render() {
    if (this.state.error) {
      const { title, message, details } = resolveErrorContent(this.state.error);

      return (
        <ErrorFallbackContent
          title={title}
          message={message}
          details={details}
          onTryAgain={this.handleTryAgain}
        />
      );
    }

    return this.props.children;
  }
}

export function GlobalError() {
  const error = useRouteError();

  useEffect(() => {
    logApplicationError(error, undefined, {
      source: "route-error-boundary",
    });
  }, [error]);

  const { title, message, details } = resolveErrorContent(error);

  return (
    <ErrorFallbackContent title={title} message={message} details={details} />
  );
}

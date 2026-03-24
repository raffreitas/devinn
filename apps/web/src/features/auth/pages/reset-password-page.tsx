import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, Loader2, Lock } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useResetPassword } from "@/features/auth/hooks/use-password-reset";
import { createPasswordSchema } from "@/features/auth/lib/password-schema";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";

const resetPasswordSchema = z
  .object({
    newPassword: createPasswordSchema("A nova senha"),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const resetPassword = useResetPassword();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const token = searchParams.get("token");
  const hasValidLink = Boolean(userId && token);

  const defaultValues = useMemo<ResetPasswordFormData>(
    () => ({
      newPassword: "",
      confirmPassword: "",
    }),
    [],
  );

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!userId || !token) {
      toast.error("O link de redefinição é inválido ou expirou.");
      return;
    }

    try {
      await resetPassword.mutateAsync({
        userId,
        token,
        newPassword: data.newPassword,
      });

      toast.success("Senha redefinida com sucesso. Faça login novamente.");
      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Não foi possível redefinir sua senha.";

      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen grid lg:grid-cols-2">
        <div className="relative hidden lg:flex items-center justify-center overflow-hidden bg-muted/30 dark:bg-muted/10">
          <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808014_1px,transparent_1px),linear-gradient(to_bottom,#80808014_1px,transparent_1px)] bg-size-[14px_24px]" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-background to-background" />

          <div className="mx-auto max-w-md px-10">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
              <span className="size-2 rounded-full bg-primary" />
              Link único e temporário
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight">
              DevInn
            </h1>
            <p className="mt-3 text-muted-foreground">
              Defina uma nova senha forte para restaurar o acesso à sua conta.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center p-4 sm:p-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Redefinir senha</CardTitle>
              <CardDescription>
                Use no mínimo 8 caracteres, com 1 letra maiúscula, 1 número e 1
                símbolo.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {!hasValidLink ? (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle>Link inválido</AlertTitle>
                  <AlertDescription>
                    Este link de redefinição está incompleto ou expirou.
                    Solicite um novo link para continuar.
                  </AlertDescription>
                </Alert>
              ) : null}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="password"
                              autoComplete="new-password"
                              placeholder="••••••••"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar nova senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="password"
                              autoComplete="new-password"
                              placeholder="••••••••"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!hasValidLink || resetPassword.isPending}
                  >
                    {resetPassword.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Redefinindo senha...
                      </>
                    ) : (
                      "Salvar nova senha"
                    )}
                  </Button>
                </form>
              </Form>

              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Solicitar um novo link
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

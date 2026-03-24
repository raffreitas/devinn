import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail, MailCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useForgotPassword } from "@/features/auth/hooks/use-password-reset";
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

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Informe um email válido"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const [emailSubmitted, setEmailSubmitted] = useState<string | null>(null);

  const defaultValues = useMemo<ForgotPasswordFormData>(
    () => ({
      email: "",
    }),
    [],
  );

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword.mutateAsync(data);
      setEmailSubmitted(data.email);
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Não foi possível enviar o link de recuperação.";

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
              Segurança de acesso
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight">
              DevInn
            </h1>
            <p className="mt-3 text-muted-foreground">
              Recupere o acesso com segurança e volte a gerenciar reservas,
              despesas e operações do seu negócio.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center p-4 sm:p-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Esqueceu sua senha?</CardTitle>
              <CardDescription>
                Informe seu email para enviarmos um link seguro de redefinição.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {emailSubmitted ? (
                <Alert>
                  <MailCheck />
                  <AlertTitle>Verifique sua caixa de entrada</AlertTitle>
                  <AlertDescription>
                    Se existir uma conta vinculada a este e-mail, você receberá
                    em instantes um link para redefinir sua senha.
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="email"
                              inputMode="email"
                              autoComplete="email"
                              placeholder="seuemail@exemplo.com"
                              className="pl-9"
                              aria-invalid={Boolean(
                                form.formState.errors.email,
                              )}
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
                    disabled={forgotPassword.isPending}
                  >
                    {forgotPassword.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Enviando link...
                      </>
                    ) : (
                      "Enviar link de recuperação"
                    )}
                  </Button>
                </form>
              </Form>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Voltar para o login
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

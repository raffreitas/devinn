import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { useLogin } from "../hooks/use-login";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Informe um email válido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const defaultValues = useMemo<LoginFormData>(
    () => ({
      email: "",
      password: "",
    }),
    [],
  );

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const onSubmit = (data: LoginFormData) => {
    login.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left / Brand */}
        <div className="relative hidden lg:flex items-center justify-center overflow-hidden bg-muted/30 dark:bg-muted/10">
          <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808014_1px,transparent_1px),linear-gradient(to_bottom,#80808014_1px,transparent_1px)] bg-size-[14px_24px]" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-background to-background" />

          <div className="mx-auto max-w-md px-10">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
              <span className="size-2 rounded-full bg-primary" />
              Gerenciamento de pousadas
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight">
              DevInn
            </h1>
            <p className="mt-3 text-muted-foreground">
              Controle reservas, despesas e operações do seu negócio em um só
              lugar.
            </p>
          </div>
        </div>

        {/* Right / Form */}
        <div className="flex items-center justify-center p-4 sm:p-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Entrar</CardTitle>
              <CardDescription>
                Use seu email e senha para acessar o DevInn.
              </CardDescription>
            </CardHeader>

            <CardContent>
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

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              autoComplete="current-password"
                              placeholder="••••••••"
                              className="pl-9 pr-10"
                              aria-invalid={Boolean(
                                form.formState.errors.password,
                              )}
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              aria-label={
                                showPassword ? "Ocultar senha" : "Mostrar senha"
                              }
                            >
                              {showPassword ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={login.isPending}
                  >
                    {login.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

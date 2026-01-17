import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { authService } from "../services/auth-service";

const signInSchema = z.object({
  email: z
    .email({ error: "E-mail inválido" })
    .min(1, { error: "E-mail é obrigatório" }),
  password: z
    .string({ error: "Senha inválida" })
    .min(6, { error: "Senha deve ter no mínimo 6 caracteres" }),
});

type SignInSchema = z.infer<typeof signInSchema>;

export function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const { mutateAsync: authenticate } = useMutation({
    mutationFn: authService.signIn,
  });

  async function handleAuthenticate({ email, password }: SignInSchema) {
    try {
      await authenticate({ email, password });
    } catch {
      toast.error("Credenciais inválidas");
    }
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-6 px-2 sm:px-0">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Acessar</h1>
        </div>

        <div className="grid gap-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAuthenticate)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        autoComplete="email"
                        {...field}
                      />
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
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Acessando..." : "Acessar"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

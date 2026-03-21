import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2Icon,
  CreditCardIcon,
  Loader2Icon,
  PlugIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { useInn, useUpdateInn } from "@/features/inns/hooks/use-inns";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

const innSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  address: z.string().min(5, "Endereço é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  zipCode: z.string().min(8, "CEP inválido"),
  country: z.string().min(2, "País é obrigatório"),
});

export function SettingsPage() {
  const { innId } = useAuth();
  const { data: inn, isLoading } = useInn(innId || "");
  const updateInn = useUpdateInn();

  const innForm = useForm<z.infer<typeof innSchema>>({
    resolver: zodResolver(innSchema),
    defaultValues: {
      name: inn?.name || "",
      email: inn?.email || "",
      phone: inn?.phone || "",
      address: inn?.address || "",
      city: inn?.city || "",
      state: inn?.state || "",
      zipCode: inn?.zipCode || "",
      country: inn?.country || "",
    },
    values: inn
      ? {
          name: inn.name,
          email: inn.email,
          phone: inn.phone,
          address: inn.address,
          city: inn.city,
          state: inn.state,
          zipCode: inn.zipCode,
          country: inn.country,
        }
      : undefined,
  });

  async function onInnSubmit(values: z.infer<typeof innSchema>) {
    if (!innId) return;
    
    try {
      await updateInn.mutateAsync({ id: innId, payload: values });
      toast.success("Dados da pousada atualizados com sucesso!");
    } catch {
      toast.error("Erro ao atualizar dados da pousada");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie os dados da sua pousada, pagamentos e integrações.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
          <TabsTrigger
            value="general"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 gap-2"
          >
            <Building2Icon className="size-4" />
            <span>Dados da Pousada</span>
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 gap-2"
          >
            <CreditCardIcon className="size-4" />
            <span>Pagamentos</span>
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 gap-2"
          >
            <PlugIcon className="size-4" />
            <span>Integrações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados Gerais</CardTitle>
              <CardDescription>
                Informações principais que aparecem para seus hóspedes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...innForm}>
                <form
                  onSubmit={innForm.handleSubmit(onInnSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={innForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Pousada</FormLabel>
                          <FormControl>
                            <Input placeholder="Pousada Exemplo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={innForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email de Contato</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contato@pousada.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={innForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone / WhatsApp</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={innForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Endereço Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua das Flores, 123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={innForm.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={innForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="São Paulo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={innForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="SP" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={innForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País</FormLabel>
                          <FormControl>
                            <Input placeholder="Brasil" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit">Salvar Dados da Pousada</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gateway de Pagamentos</CardTitle>
              <CardDescription>
                Configure as credenciais da API para aceitar reservas diretas (Em breve).
              </CardDescription>
            </CardHeader>
            <CardContent className="h-40 flex items-center justify-center border-dashed border-2 rounded-lg bg-muted/20">
              <span className="text-muted-foreground font-medium">
                Funcionalidade em desenvolvimento
              </span>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Chaves de API (Webhooks)</CardTitle>
              <CardDescription>
                Conecte a pousada com outros serviços via Webhooks e API Keys (Em breve).
              </CardDescription>
            </CardHeader>
            <CardContent className="h-40 flex items-center justify-center border-dashed border-2 rounded-lg bg-muted/20">
              <span className="text-muted-foreground font-medium">
                Funcionalidade em desenvolvimento
              </span>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

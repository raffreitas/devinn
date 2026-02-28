import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRooms } from "@/features/inventory/hooks";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const integrationSchema = z.object({
  channelType: z.enum(["Booking", "Airbnb"]),
  iCalUrl: z.string().url("URL inválida").min(1, "URL é obrigatória"),
  roomId: z.string().min(1, "Quarto é obrigatório"),
});

type IntegrationFormData = z.infer<typeof integrationSchema>;

interface IntegrationFormProps {
  onSubmit: (data: IntegrationFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  fixedRoomId?: string;
  inline?: boolean;
}

export function IntegrationForm({
  onSubmit,
  onCancel,
  isSubmitting,
  fixedRoomId,
  inline,
}: IntegrationFormProps) {
  const { data: rooms } = useRooms();

  const form = useForm<IntegrationFormData>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      channelType: "Booking",
      iCalUrl: "",
      roomId: fixedRoomId || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div
          className={
            inline ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"
          }
        >
          <FormField
            control={form.control}
            name="channelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Canal</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-9" data-size="default">
                      <SelectValue placeholder="Selecione o canal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Booking">Booking.com</SelectItem>
                    <SelectItem value="Airbnb">Airbnb</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {!fixedRoomId && (
            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quarto</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-9" data-size="default">
                        <SelectValue placeholder="Selecione o quarto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rooms?.items?.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          Quarto {room.number} - {room.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="iCalUrl"
            render={({ field }) => (
              <FormItem
                className={inline && fixedRoomId ? "sm:col-span-2" : ""}
              >
                <FormLabel>URL do iCal</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size={inline ? "sm" : "default"}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size={inline ? "sm" : "default"}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Criando..." : "Adicionar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

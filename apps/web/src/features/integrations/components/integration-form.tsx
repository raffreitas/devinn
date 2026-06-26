import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRooms } from "@/features/inventory/hooks";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
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
import { usePreviewICalFeed } from "../hooks/use-integrations";
import type { PreviewICalFeedResponse } from "../types";

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
  const { data: rooms } = useRooms({ pageSize: 100 });
  const { previewICalFeed, isPending: isPreviewing } = usePreviewICalFeed();
  const [previewResult, setPreviewResult] =
    useState<PreviewICalFeedResponse | null>(null);
  const [previewedValues, setPreviewedValues] = useState<{
    channelType: IntegrationFormData["channelType"];
    iCalUrl: string;
  } | null>(null);

  const form = useForm<IntegrationFormData>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      channelType: "Booking",
      iCalUrl: "",
      roomId: fixedRoomId || "",
    },
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      setPreviewResult(null);
      setPreviewedValues(null);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const currentValues = form.watch(["channelType", "iCalUrl"]);
  const hasValidPreview =
    previewResult?.isValid === true &&
    previewedValues?.channelType === currentValues[0] &&
    previewedValues?.iCalUrl === currentValues[1];

  const handlePreview = async () => {
    const isValid = await form.trigger(["channelType", "iCalUrl"]);
    if (!isValid) return;

    const values = form.getValues();
    const result = await previewICalFeed({
      channelType: values.channelType,
      iCalUrl: values.iCalUrl,
    });

    setPreviewResult(result);
    setPreviewedValues({
      channelType: values.channelType,
      iCalUrl: values.iCalUrl,
    });
  };

  const handleSubmit = async (data: IntegrationFormData) => {
    if (!hasValidPreview) {
      form.setError("iCalUrl", {
        type: "manual",
        message: "Teste o link antes de adicionar a sincronização.",
      });
      return;
    }

    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                <FormLabel>URL do calendário</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size={inline ? "sm" : "default"}
            onClick={handlePreview}
            disabled={isPreviewing || isSubmitting}
          >
            {isPreviewing && (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            )}
            Testar link
          </Button>

          {previewResult && (
            <Alert variant={previewResult.isValid ? "default" : "destructive"}>
              {previewResult.isValid ? <CheckCircle2 /> : <AlertCircle />}
              <AlertTitle>
                {previewResult.isValid ? "Link validado" : "Link não validado"}
              </AlertTitle>
              <AlertDescription>{previewResult.message}</AlertDescription>
            </Alert>
          )}
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
            disabled={isSubmitting || !hasValidPreview}
          >
            {isSubmitting ? "Criando..." : "Adicionar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

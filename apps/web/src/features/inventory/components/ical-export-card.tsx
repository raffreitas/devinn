import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface ICalExportCardProps {
  roomName: string;
  roomNumber: number;
  iCalExportToken: string;
}

export function ICalExportCard({
  roomName,
  roomNumber,
  iCalExportToken,
}: ICalExportCardProps) {
  const [copied, setCopied] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
  const iCalUrl = `${baseUrl}/api/ical/${iCalExportToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(iCalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleOpenInBrowser = () => {
    window.open(iCalUrl, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Exportar iCal</CardTitle>
        <CardDescription>
          Use esta URL para sincronizar disponibilidade do{" "}
          {roomName || `Quarto ${roomNumber}`} com outras plataformas (Airbnb,
          Booking.com, Google Calendar, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ical-url">URL do Feed iCal</Label>
          <div className="flex gap-2">
            <Input
              id="ical-url"
              value={iCalUrl}
              readOnly
              className="font-mono text-sm"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              title="Copiar URL"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleOpenInBrowser}
              title="Abrir no navegador"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">ℹ️ Como usar:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Copie a URL acima</li>
            <li>
              Cole na plataforma desejada (geralmente em "Calendário" ou
              "Sincronização")
            </li>
            <li>
              As reservas deste quarto serão exportadas automaticamente
            </li>
            <li>
              Reservas importadas de outros iCals não são reexportadas (evita
              loops)
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900 p-4 text-sm">
          <p className="font-medium text-orange-900 dark:text-orange-200">
            ⚠️ Segurança
          </p>
          <p className="text-orange-800 dark:text-orange-300 mt-1">
            Esta URL é privada e específica deste quarto. Não compartilhe
            publicamente. Apenas datas ficam visíveis (sem dados pessoais dos
            hóspedes).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

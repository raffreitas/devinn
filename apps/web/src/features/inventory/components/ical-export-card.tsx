import {
  Check,
  Copy,
  ExternalLink,
  InfoIcon,
} from "lucide-react";
import { useState } from "react";
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

        <Alert>
          <InfoIcon />
          <AlertTitle>Segurança</AlertTitle>
          <AlertDescription>
            Esta URL é privada e específica deste quarto. Não compartilhe
            publicamente. Apenas datas ficam visíveis (sem dados pessoais dos
            hóspedes).
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

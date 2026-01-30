import { Calendar, Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

interface ICalPopoverProps {
  roomName: string;
  roomNumber: number;
  iCalExportToken: string;
}

export function ICalPopover({
  roomName,
  roomNumber,
  iCalExportToken,
}: ICalPopoverProps) {
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
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" title="URL iCal">
          <Calendar className="h-4 w-4" />
          <span className="sr-only">iCal URL</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm">Exportar iCal</h4>
            <p className="text-xs text-muted-foreground mt-1">
              URL para sincronizar {roomName || `Quarto ${roomNumber}`} com
              outras plataformas
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              value={iCalUrl}
              readOnly
              className="font-mono text-xs h-8"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleCopy}
              title="Copiar URL"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleOpenInBrowser}
              title="Abrir no navegador"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            ⚠️ URL privada. Não compartilhe publicamente.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

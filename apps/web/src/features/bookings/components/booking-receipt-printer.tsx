import { pdf } from "@react-pdf/renderer";
import { Download, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { Booking } from "../types";
import { BookingReceiptPdf } from "./booking-receipt-pdf";
import { BookingReceiptTemplate } from "./booking-receipt-template";

interface BookingReceiptPrinterProps {
  booking: Booking;
  innName?: string;
}

/**
 * Componente de impressão/PDF para comprovante de reserva
 * Utiliza react-to-print para gerar PDF via navegador
 *
 * Funcionalidades:
 * - Abre diálogo de impressão do navegador
 * - Permite salvar como PDF
 * - Feedback visual de carregamento
 *
 * Uso:
 * <BookingReceiptPrinter booking={booking} innName={innName} />
 */
export function BookingReceiptPrinter({
  booking,
  innName,
}: BookingReceiptPrinterProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  // Referência para resolver Promise quando o DOM é atualizado
  const promiseResolveRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isPrinting && promiseResolveRef.current) {
      promiseResolveRef.current();
    }
  }, [isPrinting]);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Comprovante-Reserva-${booking.id}`,
    onBeforePrint: () => {
      return new Promise((resolve) => {
        promiseResolveRef.current = resolve;
        setIsPrinting(true);
      });
    },
    onAfterPrint: () => {
      promiseResolveRef.current = null;
      setIsPrinting(false);
    },
  });

  const handleDownloadPdf = async () => {
    setIsDownloading(true);

    try {
      const blob = await pdf(
        <BookingReceiptPdf booking={booking} innName={innName} />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Comprovante-Reserva-${booking.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (_error) {
      toast.error("Erro ao gerar o PDF do comprovante");
    } finally {
      setIsDownloading(false);
    }
  };

  const isBusy = isPrinting || isDownloading;

  return (
    <>
      {/* Hidden component for printing - não aparece na tela */}
      <div style={{ display: "none" }}>
        <div ref={contentRef}>
          <BookingReceiptTemplate booking={booking} innName={innName} />
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={isBusy}
            title="Comprovante"
          >
            <Download className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              void handleDownloadPdf();
            }}
            disabled={isBusy}
          >
            <Download className="w-4 h-4" />
            Baixar PDF
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              handlePrint();
            }}
            disabled={isBusy}
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

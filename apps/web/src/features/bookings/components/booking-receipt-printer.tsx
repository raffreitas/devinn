import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/shared/components/ui/button";
import type { Booking } from "../types";
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
export function BookingReceiptPrinter({ booking, innName }: BookingReceiptPrinterProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Referência para resolver Promise quando o DOM é atualizado
  const promiseResolveRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isLoading && promiseResolveRef.current) {
      promiseResolveRef.current();
    }
  }, [isLoading]);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Comprovante-Reserva-${booking.id}`,
    onBeforePrint: () => {
      return new Promise((resolve) => {
        promiseResolveRef.current = resolve;
        setIsLoading(true);
      });
    },
    onAfterPrint: () => {
      promiseResolveRef.current = null;
      setIsLoading(false);
    },
  });

  return (
    <>
      {/* Hidden component for printing - não aparece na tela */}
      <div style={{ display: "none" }}>
        <div ref={contentRef}>
          <BookingReceiptTemplate booking={booking} innName={innName} />
        </div>
      </div>

      {/* Botão para abrir diálogo de impressão/PDF */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePrint()}
        disabled={isLoading}
        title="Baixar/Imprimir comprovante"
      >
        <Download className="w-4 h-4" />
      </Button>
    </>
  );
}

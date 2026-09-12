import { pdf } from "@react-pdf/renderer";
import { Download, FileEdit, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import { InputMoney } from "@/shared/components/input-money";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Label } from "@/shared/components/ui/label";
import { Spinner } from "@/shared/components/ui/spinner";
import { formatMoney } from "@/shared/lib/utils";
import type { Booking, BookingReceiptOptions } from "../types";
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
 * - Abre diálogo de impressão do navegador (padrão ou com valor personalizado)
 * - Permite salvar como PDF (padrão ou com valor personalizado)
 * - Feedback visual de carregamento
 *
 * Uso:
 * <BookingReceiptPrinter booking={booking} innName={innName} />
 */
export function BookingReceiptPrinter({
  booking,
  innName,
}: BookingReceiptPrinterProps) {
  const standardContentRef = useRef<HTMLDivElement>(null);
  const customContentRef = useRef<HTMLDivElement>(null);

  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState<number | undefined>(
    undefined,
  );
  const [hasInteracted, setHasInteracted] = useState(false);

  // Referência para resolver Promise quando o DOM é atualizado
  const promiseResolveRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isPrinting && promiseResolveRef.current) {
      promiseResolveRef.current();
    }
  }, [isPrinting]);

  const handlePrint = useReactToPrint({
    contentRef: standardContentRef,
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

  const handleCustomPrint = useReactToPrint({
    contentRef: customContentRef,
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

  const handleDownloadPdf = async (options?: BookingReceiptOptions) => {
    setIsDownloading(true);

    try {
      const blob = await pdf(
        <BookingReceiptPdf
          booking={booking}
          innName={innName}
          options={options}
        />,
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

  const handleCloseCustomModal = () => {
    setIsCustomModalOpen(false);
    setCustomAmount(undefined);
    setHasInteracted(false);
  };

  const isValidAmount =
    typeof customAmount === "number" &&
    !Number.isNaN(customAmount) &&
    customAmount > 0;

  const isBusy = isPrinting || isDownloading;

  const handleCustomDownloadPdf = async () => {
    if (!isValidAmount || isBusy) return;
    await handleDownloadPdf({ customAmount });
  };

  const handleCustomPrintClick = () => {
    if (!isValidAmount || isBusy) return;
    handleCustomPrint();
  };

  return (
    <>
      {/* Hidden components for printing - não aparecem na tela */}
      <div style={{ display: "none" }}>
        <div ref={standardContentRef}>
          <BookingReceiptTemplate booking={booking} innName={innName} />
        </div>
        <div ref={customContentRef}>
          <BookingReceiptTemplate
            booking={booking}
            innName={innName}
            options={{ customAmount: customAmount ?? 0 }}
          />
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
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setIsCustomModalOpen(true);
            }}
            disabled={isBusy}
          >
            <FileEdit className="w-4 h-4" />
            Comprovante com valor personalizado
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={isCustomModalOpen}
        onOpenChange={(open) => {
          if (!open && !isBusy) {
            handleCloseCustomModal();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Comprovante com valor personalizado</DialogTitle>
            <DialogDescription>
              Informe o valor a ser exibido no comprovante. A reserva original
              não será alterada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Valor atual da reserva (referência)
              </span>
              <p className="text-base font-semibold text-foreground">
                {formatMoney(booking.pricing.total)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-receipt-amount">
                Valor a exibir no comprovante{" "}
                <span className="text-destructive">*</span>
              </Label>
              <InputMoney
                id="custom-receipt-amount"
                value={customAmount}
                onChange={(val) => {
                  setCustomAmount(val);
                  setHasInteracted(true);
                }}
                placeholder="R$ 0,00"
                autoFocus
                disabled={isBusy}
              />
              {hasInteracted && !isValidAmount && (
                <p className="text-xs font-medium text-destructive">
                  O valor é obrigatório e deve ser maior que zero.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseCustomModal}
              disabled={isBusy}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCustomPrintClick}
              disabled={!isValidAmount || isBusy}
            >
              {isPrinting ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Imprimindo...
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => void handleCustomDownloadPdf()}
              disabled={!isValidAmount || isBusy}
            >
              {isDownloading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Baixando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

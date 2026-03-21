import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCpf, formatPhone } from "@/shared/lib/utils";
import type { Booking } from "../types";

interface BookingReceiptTemplateProps {
  booking: Booking;
  innName?: string;
}

export const BookingReceiptTemplate = ({
  booking,
  innName,
}: BookingReceiptTemplateProps) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const nights = differenceInDays(checkOut, checkIn);

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        color: "#1f2937",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "30px",
          borderBottom: "2px solid #e5e7eb",
          paddingBottom: "10px",
        }}
      >
        {innName && (
          <p
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              margin: "0 0 10px 0",
              color: "#2563eb",
            }}
          >
            {innName}
          </p>
        )}
        <h1
          style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 10px 0" }}
        >
          COMPROVANTE DE RESERVA
        </h1>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "5px 0" }}>
          Reserva #{booking.id}
        </p>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "5px 0" }}>
          Gerado em {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </p>
      </div>

      {/* Guest Information */}
      <div style={{ marginBottom: "15px" }}>
        <h2
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "15px",
            color: "#374151",
          }}
        >
          DADOS DO HÓSPEDE
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "11px",
                color: "#6b7280",
                margin: "0 0 5px 0",
                fontWeight: "bold",
              }}
            >
              NOME
            </p>
            <p style={{ fontSize: "13px", margin: "0", fontWeight: "500" }}>
              {booking.guest?.name}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: "11px",
                color: "#6b7280",
                margin: "0 0 5px 0",
                fontWeight: "bold",
              }}
            >
              TELEFONE
            </p>
            <p style={{ fontSize: "13px", margin: "0", fontWeight: "500" }}>
              {formatPhone(booking.guest?.phone)}
            </p>
          </div>
          {booking.guest?.email && (
            <div>
              <p
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  margin: "0 0 5px 0",
                  fontWeight: "bold",
                }}
              >
                E-MAIL
              </p>
              <p style={{ fontSize: "13px", margin: "0", fontWeight: "500" }}>
                {booking.guest.email}
              </p>
            </div>
          )}
          {booking.guest?.document && (
            <div>
              <p
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  margin: "0 0 5px 0",
                  fontWeight: "bold",
                }}
              >
                DOCUMENTO
              </p>
              <p style={{ fontSize: "13px", margin: "0", fontWeight: "500" }}>
                {formatCpf(booking.guest.document)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details */}
      <div style={{ marginBottom: "15px" }}>
        <h2
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "15px",
            color: "#374151",
          }}
        >
          DETALHES DA RESERVA
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "11px",
                color: "#6b7280",
                margin: "0 0 5px 0",
                fontWeight: "bold",
              }}
            >
              ACOMODAÇÃO
            </p>
            <p style={{ fontSize: "13px", margin: "0", fontWeight: "500" }}>
              Quarto {booking.number}
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                margin: "3px 0 0 0",
              }}
            >
              {booking.categoryName}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: "11px",
                color: "#6b7280",
                margin: "0 0 5px 0",
                fontWeight: "bold",
              }}
            >
              PERÍODO
            </p>
            <p style={{ fontSize: "13px", margin: "0", fontWeight: "500" }}>
              {format(checkIn, "dd/MM/yyyy", { locale: ptBR })} a{" "}
              {format(checkOut, "dd/MM/yyyy", { locale: ptBR })}
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                margin: "3px 0 0 0",
              }}
            >
              {nights} noite(s)
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: "11px",
                color: "#6b7280",
                margin: "0 0 5px 0",
                fontWeight: "bold",
              }}
            >
              HÓSPEDES
            </p>
            <p style={{ fontSize: "13px", margin: "0", fontWeight: "500" }}>
              {booking.adults} adulto(s)
              {booking.children > 0 && ` e ${booking.children} criança(s)`}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: "11px",
                color: "#6b7280",
                margin: "0 0 5px 0",
                fontWeight: "bold",
              }}
            >
              STATUS
            </p>
            <p style={{ fontSize: "13px", margin: "0", fontWeight: "500" }}>
              {booking.status === "Scheduled" && "Agendada"}
              {booking.status === "CheckedIn" && "Hospedado"}
              {booking.status === "Completed" && "Concluída"}
              {booking.status === "Canceled" && "Cancelada"}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div
        style={{
          marginBottom: "15px",
          backgroundColor: "#f9fafb",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        <h2
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "15px",
            color: "#374151",
          }}
        >
          RESUMO FINANCEIRO
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              Diária base ({booking.categoryName})
            </span>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>
              {formatCurrency(booking.pricing.basePrice)}
            </span>
          </div>

          {booking.pricing.numberOfExtraGuests > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                {booking.pricing.numberOfExtraGuests} hóspede(s) extra(s)
              </span>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>
                {formatCurrency(
                  booking.pricing.extraGuestPrice *
                    booking.pricing.numberOfExtraGuests,
                )}
              </span>
            </div>
          )}

          <div
            style={{
              borderTop: "1px solid #d1d5db",
              paddingTop: "10px",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                Subtotal por diária
              </span>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>
                {formatCurrency(
                  booking.pricing.basePrice +
                    booking.pricing.extraGuestPrice *
                      booking.pricing.numberOfExtraGuests,
                )}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                Total por {nights} noite(s)
              </span>
              <span style={{ fontSize: "13px", fontWeight: "600" }}>
                {formatCurrency(booking.pricing.subtotal)}
              </span>
            </div>
          </div>

          {booking.pricing.discounts > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#dc2626",
              }}
            >
              <span style={{ fontSize: "12px" }}>Descontos</span>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>
                - {formatCurrency(booking.pricing.discounts)}
              </span>
            </div>
          )}

          <div
            style={{
              borderTop: "2px solid #d1d5db",
              paddingTop: "12px",
              marginTop: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontSize: "14px", fontWeight: "bold", color: "#1f2937" }}
            >
              Total da Reserva
            </span>
            <span
              style={{ fontSize: "16px", fontWeight: "bold", color: "#2563eb" }}
            >
              {formatCurrency(booking.pricing.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div style={{ marginBottom: "15px" }}>
        <h2
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "15px",
            color: "#374151",
          }}
        >
          INFORMAÇÕES DE PAGAMENTO
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "15px",
          }}
        >
          <div
            style={{
              backgroundColor: "#f0fdf4",
              padding: "15px",
              borderRadius: "6px",
              border: "1px solid #d1fae5",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "#047857",
                margin: "0 0 5px 0",
                fontWeight: "bold",
              }}
            >
              VALOR PAGO
            </p>
            <p
              style={{
                fontSize: "15px",
                fontWeight: "bold",
                color: "#059669",
                margin: "0",
              }}
            >
              {formatCurrency(booking.totalPaid)}
            </p>
          </div>

          <div
            style={{
              backgroundColor: booking.balanceDue > 0 ? "#fef2f2" : "#f0fdf4",
              padding: "15px",
              borderRadius: "6px",
              border:
                booking.balanceDue > 0
                  ? "1px solid #fee2e2"
                  : "1px solid #d1fae5",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: booking.balanceDue > 0 ? "#dc2626" : "#047857",
                margin: "0 0 5px 0",
                fontWeight: "bold",
              }}
            >
              SALDO DEVEDOR
            </p>
            <p
              style={{
                fontSize: "15px",
                fontWeight: "bold",
                color: booking.balanceDue > 0 ? "#dc2626" : "#059669",
                margin: "0",
              }}
            >
              {formatCurrency(booking.balanceDue)}
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#eff6ff",
              padding: "15px",
              borderRadius: "6px",
              border: "1px solid #dbeafe",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "#1e40af",
                margin: "0 0 5px 0",
                fontWeight: "bold",
              }}
            >
              TOTAL
            </p>
            <p
              style={{
                fontSize: "15px",
                fontWeight: "bold",
                color: "#2563eb",
                margin: "0",
              }}
            >
              {formatCurrency(booking.pricing.total)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "2px solid #e5e7eb",
          paddingTop: "10px",
          textAlign: "center",
          fontSize: "11px",
          color: "#6b7280",
        }}
      >
        <p style={{ margin: "5px 0" }}>
          Este é um comprovante oficial de sua reserva.
        </p>
        <p style={{ margin: "5px 0" }}>
          Para dúvidas ou alterações, entre em contato conosco.
        </p>
        <p style={{ margin: "10px 0 0 0", fontSize: "10px" }}>
          © {new Date().getFullYear()} DevInn. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

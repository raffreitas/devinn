import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Booking } from "../types";

interface BookingReceiptPdfProps {
  booking: Booking;
  innName?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#111827",
  },
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
  },
  innName: {
    fontSize: 10,
    marginBottom: 6,
    color: "#2563eb",
    fontWeight: 700,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 6,
  },
  meta: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 2,
  },
  section: {
    marginTop: 12,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#374151",
    marginBottom: 8,
  },
  grid2: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flexGrow: 1,
    flexBasis: 0,
  },
  label: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 3,
    fontWeight: 700,
  },
  value: {
    fontSize: 10,
    fontWeight: 500,
  },
  box: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: "#d1d5db",
    borderTopStyle: "solid",
    paddingTop: 8,
    marginTop: 8,
  },
  totalValue: {
    color: "#2563eb",
    fontWeight: 700,
  },
  footer: {
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
    textAlign: "center",
    color: "#6b7280",
    fontSize: 9,
  },
});

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function statusLabel(status: Booking["status"]) {
  if (status === "Scheduled") return "Agendada";
  if (status === "CheckedIn") return "Hospedado";
  if (status === "Completed") return "Concluída";
  return "Cancelada";
}

export function BookingReceiptPdf({
  booking,
  innName,
}: BookingReceiptPdfProps) {
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const nights = differenceInDays(checkOut, checkIn);

  return (
    <Document title={`Comprovante-Reserva-${booking.id}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {innName && <Text style={styles.innName}>{innName}</Text>}
          <Text style={styles.title}>COMPROVANTE DE RESERVA</Text>
          <Text style={styles.meta}>Reserva #{booking.id}</Text>
          <Text style={styles.meta}>
            Gerado em {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DADOS DO HÓSPEDE</Text>
          <View style={styles.grid2}>
            <View style={styles.col}>
              <Text style={styles.label}>NOME</Text>
              <Text style={styles.value}>{booking.guest.name}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>TELEFONE</Text>
              <Text style={styles.value}>{booking.guest.phone}</Text>
            </View>
          </View>
          {booking.guest.email ? (
            <View style={[styles.grid2, { marginTop: 10 }]}>
              <View style={styles.col}>
                <Text style={styles.label}>E-MAIL</Text>
                <Text style={styles.value}>{booking.guest.email}</Text>
              </View>
              {booking.guest.document ? (
                <View style={styles.col}>
                  <Text style={styles.label}>DOCUMENTO</Text>
                  <Text style={styles.value}>{booking.guest.document}</Text>
                </View>
              ) : (
                <View style={styles.col} />
              )}
            </View>
          ) : booking.guest.document ? (
            <View style={[styles.grid2, { marginTop: 10 }]}>
              <View style={styles.col}>
                <Text style={styles.label}>DOCUMENTO</Text>
                <Text style={styles.value}>{booking.guest.document}</Text>
              </View>
              <View style={styles.col} />
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DETALHES DA RESERVA</Text>
          <View style={styles.grid2}>
            <View style={styles.col}>
              <Text style={styles.label}>ACOMODAÇÃO</Text>
              <Text style={styles.value}>Quarto {booking.number}</Text>
              <Text style={{ fontSize: 9, color: "#6b7280", marginTop: 2 }}>
                {booking.categoryName}
              </Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>PERÍODO</Text>
              <Text style={styles.value}>
                {format(checkIn, "dd/MM/yyyy", { locale: ptBR })} a{" "}
                {format(checkOut, "dd/MM/yyyy", { locale: ptBR })}
              </Text>
              <Text style={{ fontSize: 9, color: "#6b7280", marginTop: 2 }}>
                {nights} noite(s)
              </Text>
            </View>
          </View>
          <View style={[styles.grid2, { marginTop: 10 }]}>
            <View style={styles.col}>
              <Text style={styles.label}>HÓSPEDES</Text>
              <Text style={styles.value}>
                {booking.adults} adulto(s)
                {booking.children > 0
                  ? ` e ${booking.children} criança(s)`
                  : ""}
              </Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>STATUS</Text>
              <Text style={styles.value}>{statusLabel(booking.status)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RESUMO FINANCEIRO</Text>
          <View style={styles.box}>
            <View style={styles.row}>
              <Text style={{ color: "#6b7280" }}>
                Diária base ({booking.categoryName})
              </Text>
              <Text>{formatCurrency(booking.pricing.basePrice)}</Text>
            </View>

            {booking.pricing.numberOfExtraGuests > 0 ? (
              <View style={styles.row}>
                <Text style={{ color: "#6b7280" }}>
                  {booking.pricing.numberOfExtraGuests} hóspede(s) extra(s)
                </Text>
                <Text>
                  {formatCurrency(
                    booking.pricing.extraGuestPrice *
                      booking.pricing.numberOfExtraGuests,
                  )}
                </Text>
              </View>
            ) : null}

            <View style={[styles.totalRow]}>
              <View style={styles.row}>
                <Text style={{ color: "#6b7280" }}>Subtotal por diária</Text>
                <Text>
                  {formatCurrency(
                    booking.pricing.basePrice +
                      booking.pricing.extraGuestPrice *
                        booking.pricing.numberOfExtraGuests,
                  )}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={{ color: "#6b7280" }}>
                  Total por {nights} noite(s)
                </Text>
                <Text style={{ fontWeight: 700 }}>
                  {formatCurrency(booking.pricing.subtotal)}
                </Text>
              </View>
              {booking.pricing.discounts > 0 ? (
                <View style={styles.row}>
                  <Text style={{ color: "#dc2626" }}>Descontos</Text>
                  <Text style={{ color: "#dc2626" }}>
                    - {formatCurrency(booking.pricing.discounts)}
                  </Text>
                </View>
              ) : null}
              <View style={[styles.row, { marginBottom: 0, marginTop: 6 }]}>
                <Text style={{ fontWeight: 700 }}>Total da Reserva</Text>
                <Text style={[styles.totalValue]}>
                  {formatCurrency(booking.pricing.total)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMAÇÕES DE PAGAMENTO</Text>
          <View style={styles.grid2}>
            <View style={styles.col}>
              <Text style={styles.label}>VALOR PAGO</Text>
              <Text style={styles.value}>
                {formatCurrency(booking.totalPaid)}
              </Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>SALDO DEVEDOR</Text>
              <Text style={styles.value}>
                {formatCurrency(booking.balanceDue)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Este é um comprovante oficial de sua reserva.</Text>
          <Text>Para dúvidas ou alterações, entre em contato conosco.</Text>
          <Text style={{ marginTop: 6, fontSize: 8 }}>
            © {new Date().getFullYear()} DevInn. Todos os direitos reservados.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

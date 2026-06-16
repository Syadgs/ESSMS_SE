import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"
import type { Prisma } from "@prisma/client"

type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: {
    customer: true
    salesOrder: {
      include: { items: { include: { item: true } } }
    }
    createdBy: true
    payments: true
  }
}>

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 12,
  },
  companyName: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#2563eb" },
  companyTagline: { fontSize: 8, color: "#6b7280", marginTop: 2 },
  invoiceTitle: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#111827", textAlign: "right" },
  invoiceNumber: { fontSize: 11, color: "#4b5563", textAlign: "right", marginTop: 2 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 9, color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  infoBox: { width: "48%" },
  infoLabel: { fontSize: 9, color: "#6b7280", marginBottom: 2 },
  infoValue: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  infoValueSub: { fontSize: 10 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e40af",
    color: "#ffffff",
    padding: 6,
    borderRadius: 2,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  col1: { width: "5%", textAlign: "center" },
  col2: { width: "40%" },
  col3: { width: "15%", textAlign: "center" },
  col4: { width: "20%", textAlign: "right" },
  col5: { width: "20%", textAlign: "right", fontFamily: "Helvetica-Bold" },
  totalsBox: { marginTop: 16, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 },
  totalsLabel: { width: 140, textAlign: "right", color: "#6b7280" },
  totalsValue: { width: 120, textAlign: "right", fontFamily: "Helvetica-Bold" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
    borderTopWidth: 1.5,
    borderTopColor: "#2563eb",
    paddingTop: 6,
  },
  totalLabel: { width: 140, textAlign: "right", fontFamily: "Helvetica-Bold", fontSize: 12 },
  totalValue: { width: 120, textAlign: "right", fontFamily: "Helvetica-Bold", fontSize: 12, color: "#2563eb" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 8, color: "#9ca3af" },
  statusBox: { padding: 4, borderRadius: 3, marginTop: 2 },
})

function formatRupiah(n: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(n))
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
}

interface InvoicePdfProps {
  invoice: InvoiceWithRelations
}

export function InvoicePdf({ invoice }: InvoicePdfProps) {
  const items = invoice.salesOrder.items
  const totalPaid = Number(invoice.paidAmount)
  const remaining = Number(invoice.totalAmount) - totalPaid

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`} author="ESSMS">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>ESSMS</Text>
            <Text style={styles.companyTagline}>Enterprise Supply Chain &amp; Sales Management System</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          </View>
        </View>

        {/* Bill to / Invoice Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.infoValue}>{invoice.customer.customerName}</Text>
            {invoice.customer.contactPerson && (
              <Text style={styles.infoValueSub}>{invoice.customer.contactPerson}</Text>
            )}
            {invoice.customer.email && (
              <Text style={styles.infoValueSub}>{invoice.customer.email}</Text>
            )}
            {invoice.customer.address && (
              <Text style={styles.infoValueSub}>{invoice.customer.address}</Text>
            )}
          </View>
          <View style={styles.infoBox}>
            <Text style={[styles.infoLabel, { textAlign: "right" }]}>No. Sales Order</Text>
            <Text style={[styles.infoValue, { textAlign: "right" }]}>{invoice.salesOrder.soNumber}</Text>
            <Text style={[styles.infoLabel, { textAlign: "right", marginTop: 6 }]}>Date Invoice</Text>
            <Text style={[styles.infoValueSub, { textAlign: "right" }]}>{formatDate(invoice.invoiceDate)}</Text>
            <Text style={[styles.infoLabel, { textAlign: "right", marginTop: 6 }]}>Overdue</Text>
            <Text style={[styles.infoValue, { textAlign: "right", color: "#dc2626" }]}>{formatDate(invoice.dueDate)}</Text>
            <Text style={[styles.infoLabel, { textAlign: "right", marginTop: 6 }]}>Status</Text>
            <Text style={[styles.infoValue, { textAlign: "right" }]}>{invoice.status}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>#</Text>
          <Text style={styles.col2}>Item / Deskripsi</Text>
          <Text style={styles.col3}>Qty</Text>
          <Text style={styles.col4}>Harga Unit</Text>
          <Text style={styles.col5}>Subtotal</Text>
        </View>

        {items.map((line, i) => {
          const RowStyle = i % 2 === 0 ? styles.tableRow : styles.tableRowAlt
          return (
            <View key={line.id} style={RowStyle}>
              <Text style={styles.col1}>{i + 1}</Text>
              <View style={styles.col2}>
                <Text>{line.item.itemName}</Text>
                <Text style={{ fontSize: 8, color: "#6b7280" }}>{line.item.itemCode}</Text>
              </View>
              <Text style={styles.col3}>{line.quantity} {line.item.unit}</Text>
              <Text style={styles.col4}>{formatRupiah(Number(line.unitPrice))}</Text>
              <Text style={styles.col5}>{formatRupiah(Number(line.subtotal))}</Text>
            </View>
          )
        })}

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal:</Text>
            <Text style={styles.totalsValue}>{formatRupiah(Number(invoice.totalAmount))}</Text>
          </View>
          {totalPaid > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Dibayar:</Text>
              <Text style={styles.totalsValue}>{formatRupiah(totalPaid)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL TAGIHAN:</Text>
            <Text style={styles.totalValue}>{formatRupiah(remaining)}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={{ fontSize: 9, color: "#4b5563" }}>{invoice.notes}</Text>
          </View>
        )}

        {/* Payment History */}
        {invoice.payments.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            {invoice.payments.map((pay) => (
              <View key={pay.id} style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 3 }}>
                <Text style={{ fontSize: 9 }}>{formatDate(pay.paymentDate)}</Text>
                <Text style={{ fontSize: 9 }}>{pay.paymentMethod.replace("_", " ")}</Text>
                {pay.referenceNumber && <Text style={{ fontSize: 9 }}>{pay.referenceNumber}</Text>}
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>{formatRupiah(Number(pay.amount))}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            ESSMS — Enterprise Supply Chain & Sales Management System
          </Text>
          <Text style={styles.footerText}>
            Created: {formatDate(new Date())}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

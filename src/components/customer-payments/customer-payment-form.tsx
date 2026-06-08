"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createCustomerPayment } from "@/actions/customer-payment.actions"
import { formatCurrency } from "@/lib/utils"
import type { SelectOption } from "@/types"

type InvoiceOption = SelectOption & { remaining: number }

interface CustomerPaymentFormProps {
  invoices: InvoiceOption[]
}

export function CustomerPaymentForm({ invoices }: CustomerPaymentFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [invoiceId, setInvoiceId] = useState("")
  const [amount, setAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<"BANK_TRANSFER" | "CASH" | "CHECK">(
    "BANK_TRANSFER"
  )
  const [paymentDate, setPaymentDate] = useState("")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [notes, setNotes] = useState("")

  const selected = invoices.find((i) => i.value === invoiceId)

  function handleInvoiceChange(id: string) {
    setInvoiceId(id)
    const inv = invoices.find((i) => i.value === id)
    if (inv) setAmount(inv.remaining)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createCustomerPayment({
        invoiceId,
        amount,
        paymentMethod,
        paymentDate: paymentDate || undefined,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
      })
      if (result.success) {
        toast.success(result.message)
        router.push("/customer-payments")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label>Invoice *</Label>
        <Select value={invoiceId} onValueChange={handleInvoiceChange} required>
          <SelectTrigger>
            <SelectValue placeholder="Pilih invoice" />
          </SelectTrigger>
          <SelectContent>
            {invoices.map((inv) => (
              <SelectItem key={inv.value} value={inv.value}>
                {inv.label} — Sisa: {formatCurrency(inv.remaining)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected && (
        <p className="text-sm text-muted-foreground">
          Sisa tagihan: <span className="font-mono font-medium">{formatCurrency(selected.remaining)}</span>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Jumlah *</Label>
          <Input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Metode Pembayaran *</Label>
          <Select
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BANK_TRANSFER">Transfer Bank</SelectItem>
              <SelectItem value="CASH">Tunai</SelectItem>
              <SelectItem value="CHECK">Cek</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Tanggal Pembayaran</Label>
          <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>No. Referensi</Label>
          <Input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Catatan</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
        <Button type="submit" disabled={isPending || !invoiceId}>
          {isPending ? "Menyimpan..." : "Catat Pembayaran"}
        </Button>
      </div>
    </form>
  )
}

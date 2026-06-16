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
import { createBillPayment } from "@/actions/bill-payment.actions"
import { formatCurrency } from "@/lib/utils"
import type { SelectOption } from "@/types"

type BillOption = SelectOption & { remaining: number }

interface BillPaymentFormProps {
  bills: BillOption[]
}

export function BillPaymentForm({ bills }: BillPaymentFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [billId, setBillId] = useState("")
  const [amount, setAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<"BANK_TRANSFER" | "CASH" | "CHECK">(
    "BANK_TRANSFER"
  )
  const [paymentDate, setPaymentDate] = useState("")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [notes, setNotes] = useState("")

  const selected = bills.find((b) => b.value === billId)

  function handleBillChange(id: string) {
    setBillId(id)
    const bill = bills.find((b) => b.value === id)
    if (bill) setAmount(bill.remaining)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createBillPayment({
        billId,
        amount,
        paymentMethod,
        paymentDate: paymentDate || undefined,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
      })
      if (result.success) {
        toast.success(result.message)
        router.push("/bill-payments")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label>Vendor Bill *</Label>
        <Select value={billId} onValueChange={handleBillChange} required>
          <SelectTrigger>
            <SelectValue placeholder="Select bill" />
          </SelectTrigger>
          <SelectContent>
            {bills.map((b) => (
              <SelectItem key={b.value} value={b.value}>
                {b.label} — Remaining: {formatCurrency(b.remaining)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected && (
        <p className="text-sm text-muted-foreground">
          Sisa bill: <span className="font-mono font-medium">{formatCurrency(selected.remaining)}</span>
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
          <Label>Method Payment *</Label>
          <Select
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              <SelectItem value="CASH">Tunai</SelectItem>
              <SelectItem value="CHECK">Cek</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Date Payment</Label>
          <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>No. Referensi</Label>
          <Input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending || !billId}>
          {isPending ? "Saving..." : "Record Payment"}
        </Button>
      </div>
    </form>
  )
}

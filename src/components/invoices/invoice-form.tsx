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
import { createInvoice } from "@/actions/invoice.actions"
import { formatCurrency } from "@/lib/utils"
import type { SelectOption } from "@/types"

type SOOption = SelectOption & { total: number }

interface InvoiceFormProps {
  salesOrders: SOOption[]
}

export function InvoiceForm({ salesOrders }: InvoiceFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [soId, setSoId] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState("")

  const selected = salesOrders.find((s) => s.value === soId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createInvoice({
        soId,
        dueDate,
        notes: notes || undefined,
      })
      if (result.success) {
        toast.success(result.message)
        router.push(`/invoices/${result.data.id}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label>Sales Order *</Label>
        <Select value={soId} onValueChange={setSoId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select SO" />
          </SelectTrigger>
          <SelectContent>
            {salesOrders.map((so) => (
              <SelectItem key={so.value} value={so.value}>
                {so.label} — {formatCurrency(so.total)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected && (
        <p className="text-sm text-muted-foreground">
          Total: <span className="font-mono font-medium">{formatCurrency(selected.total)}</span>
        </p>
      )}

      <div className="space-y-2">
        <Label>Overdue *</Label>
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending || !soId}>
          {isPending ? "Saving..." : "Create Invoice"}
        </Button>
      </div>
    </form>
  )
}

"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createVendorBill } from "@/actions/vendor-bill.actions"
import type { SelectOption } from "@/types"

type POOption = SelectOption & { 
  grOptions?: SelectOption[]
  items?: { itemId?: string, poItemId?: string, quantity: number, unitPrice: number, description?: string }[]
}

interface VendorBillFormProps {
  purchaseOrders: POOption[]
}

export function VendorBillForm({ purchaseOrders }: VendorBillFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [poId, setPoId] = useState("")
  const [grId, setGrId] = useState("")
  const [dueDate, setDueDate] = useState("")

  const selectedPO = purchaseOrders.find((p) => p.value === poId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createVendorBill({
        billType: "PO_BASED",
        poId,
        grId: grId || undefined,
        dueDate,
        lineItems: selectedPO?.items || [],
      })
      if (result.success) {
        toast.success(result.message)
        router.push(`/vendor-bills/${result.data.id}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label>Purchase Order *</Label>
        <Select
          value={poId}
          onValueChange={(v) => {
            setPoId(v)
            setGrId("")
          }}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select PO" />
          </SelectTrigger>
          <SelectContent>
            {purchaseOrders.map((po) => (
              <SelectItem key={po.value} value={po.value}>
                {po.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPO?.grOptions && selectedPO.grOptions.length > 0 && (
        <div className="space-y-2">
          <Label>Goods Receipt (opsional)</Label>
          <Select value={grId} onValueChange={setGrId}>
            <SelectTrigger>
              <SelectValue placeholder="Select GR" />
            </SelectTrigger>
            <SelectContent>
              {selectedPO.grOptions.map((gr) => (
                <SelectItem key={gr.value} value={gr.value}>
                  {gr.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Overdue *</Label>
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Create Vendor Bill"}
        </Button>
      </div>
    </form>
  )
}

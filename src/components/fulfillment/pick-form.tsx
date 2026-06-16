"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createPickOrder } from "@/actions/fulfillment.actions"
import type { SelectOption } from "@/types"

interface PickFormProps {
  salesOrders: SelectOption[]
  warehouses: SelectOption[]
}

export function PickForm({ salesOrders, warehouses }: PickFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [soId, setSoId] = useState("")
  const [warehouseId, setWarehouseId] = useState("")
  const [notes, setNotes] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createPickOrder({ soId, warehouseId, notes: notes || undefined })
      if (result.success) {
        toast.success(result.message)
        router.push(`/pick-orders/${result.data.id}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label>Sales Order *</Label>
        <Select value={soId} onValueChange={setSoId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select SO" />
          </SelectTrigger>
          <SelectContent>
            {salesOrders.map((so) => (
              <SelectItem key={so.value} value={so.value}>
                {so.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Warehouses *</Label>
        <Select value={warehouseId} onValueChange={setWarehouseId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select warehouse" />
          </SelectTrigger>
          <SelectContent>
            {warehouses.map((w) => (
              <SelectItem key={w.value} value={w.value}>
                {w.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>
      <Button type="submit" disabled={isPending || !soId || !warehouseId}>
        {isPending ? "Creating..." : "Create Pick Order"}
      </Button>
    </form>
  )
}

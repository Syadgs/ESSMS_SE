"use client"

import { useState, useTransition, useEffect } from "react"
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
import { createGoodsReceipt } from "@/actions/goods-receipt.actions"
import type { SelectOption } from "@/types"

type POItem = {
  id: string
  itemId: string
  itemName: string
  quantity: number
}

type POOption = {
  value: string
  label: string
  items: POItem[]
}

interface GRFormProps {
  purchaseOrders: POOption[]
  warehouses: SelectOption[]
}

export function GRForm({ purchaseOrders, warehouses }: GRFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [poId, setPoId] = useState("")
  const [warehouseId, setWarehouseId] = useState("")
  const [notes, setNotes] = useState("")
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({})

  const selectedPO = purchaseOrders.find((p) => p.value === poId)

  useEffect(() => {
    if (selectedPO) {
      const initial: Record<string, number> = {}
      selectedPO.items.forEach((item) => {
        initial[item.id] = item.quantity
      })
      setReceivedQtys(initial)
    }
  }, [selectedPO])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPO) return

    const items = selectedPO.items.map((item) => ({
      poItemId: item.id,
      itemId: item.itemId,
      quantityOrdered: item.quantity,
      quantityReceived: receivedQtys[item.id] ?? 0,
    }))

    startTransition(async () => {
      const result = await createGoodsReceipt({ poId, warehouseId, notes: notes || undefined, items })
      if (result.success) {
        toast.success(result.message)
        router.push(`/goods-receipts/${result.data.id}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Purchase Order *</Label>
          <Select value={poId} onValueChange={setPoId} required>
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
      </div>

      {selectedPO && (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Item</th>
                <th className="text-right p-3 w-24">Qty Order</th>
                <th className="text-right p-3 w-32">Qty Received</th>
              </tr>
            </thead>
            <tbody>
              {selectedPO.items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">{item.itemName}</td>
                  <td className="p-3 text-right font-mono">{item.quantity}</td>
                  <td className="p-3">
                    <Input
                      type="number"
                      min={0}
                      max={item.quantity}
                      value={receivedQtys[item.id] ?? 0}
                      onChange={(e) =>
                        setReceivedQtys({
                          ...receivedQtys,
                          [item.id]: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending || !poId || !warehouseId}>
          {isPending ? "Saving..." : "Save Goods Receipt"}
        </Button>
      </div>
    </form>
  )
}

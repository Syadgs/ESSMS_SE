"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { createAdjustment } from "@/actions/inventory.actions"
import type { SelectOption } from "@/types"
import type { AdjustmentType } from "@prisma/client"

const adjustmentFormSchema = z.object({
  itemId: z.string().min(1, "Item must be selected"),
  warehouseId: z.string().min(1, "Warehouses must be selected"),
  adjustmentType: z.enum(["INCREASE", "DECREASE"]),
  quantity: z.coerce.number().int().min(1, "Jumlah at least 1"),
  reason: z.string().optional(),
})

type AdjustmentFormValues = z.infer<typeof adjustmentFormSchema>

const ADJUSTMENT_TYPE_LABELS: Record<AdjustmentType, string> = {
  INCREASE: "Penambahan",
  DECREASE: "Pengurangan",
}

interface AdjustmentFormProps {
  itemOptions: SelectOption[]
  warehouseOptions: SelectOption[]
}

export function AdjustmentForm({ itemOptions, warehouseOptions }: AdjustmentFormProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: {
      itemId: "",
      warehouseId: "",
      adjustmentType: "INCREASE",
      quantity: 1,
      reason: "",
    },
  })

  const itemId = watch("itemId")
  const warehouseId = watch("warehouseId")
  const adjustmentType = watch("adjustmentType")

  async function onSubmit(data: AdjustmentFormValues) {
    const result = await createAdjustment({
      ...data,
      reason: data.reason || undefined,
    })

    if (result.success) {
      toast.success(result.message)
      router.push("/inventory/adjustments")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Item</Label>
              <Select value={itemId} onValueChange={(v) => setValue("itemId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {itemOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.itemId && (
                <p className="text-sm text-destructive">{errors.itemId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Warehouses</Label>
              <Select value={warehouseId} onValueChange={(v) => setValue("warehouseId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouseOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.warehouseId && (
                <p className="text-sm text-destructive">{errors.warehouseId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Type Adjustment</Label>
              <Select
                value={adjustmentType}
                onValueChange={(v) => setValue("adjustmentType", v as AdjustmentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ADJUSTMENT_TYPE_LABELS) as AdjustmentType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {ADJUSTMENT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Jumlah</Label>
              <Input id="quantity" type="number" min={1} {...register("quantity")} />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" {...register("reason")} rows={3} placeholder="Reason adjustment (opsional)" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Adjustment"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

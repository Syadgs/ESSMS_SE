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
import { createTransfer } from "@/actions/inventory.actions"
import type { SelectOption } from "@/types"

const transferFormSchema = z.object({
  itemId: z.string().min(1, "Item wajib dipilih"),
  fromWarehouseId: z.string().min(1, "Gudang asal wajib dipilih"),
  toWarehouseId: z.string().min(1, "Gudang tujuan wajib dipilih"),
  quantity: z.coerce.number().int().min(1, "Jumlah minimal 1"),
  notes: z.string().optional(),
})

type TransferFormValues = z.infer<typeof transferFormSchema>

interface TransferFormProps {
  itemOptions: SelectOption[]
  warehouseOptions: SelectOption[]
}

export function TransferForm({ itemOptions, warehouseOptions }: TransferFormProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      itemId: "",
      fromWarehouseId: "",
      toWarehouseId: "",
      quantity: 1,
      notes: "",
    },
  })

  const itemId = watch("itemId")
  const fromWarehouseId = watch("fromWarehouseId")
  const toWarehouseId = watch("toWarehouseId")

  async function onSubmit(data: TransferFormValues) {
    const result = await createTransfer({
      ...data,
      notes: data.notes || undefined,
    })

    if (result.success) {
      toast.success(result.message)
      router.push(`/inventory/transfers/${result.data.id}`)
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
            <div className="space-y-2 md:col-span-2">
              <Label>Item</Label>
              <Select value={itemId} onValueChange={(v) => setValue("itemId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih item" />
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
              <Label>Gudang Asal</Label>
              <Select value={fromWarehouseId} onValueChange={(v) => setValue("fromWarehouseId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih gudang asal" />
                </SelectTrigger>
                <SelectContent>
                  {warehouseOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fromWarehouseId && (
                <p className="text-sm text-destructive">{errors.fromWarehouseId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Gudang Tujuan</Label>
              <Select value={toWarehouseId} onValueChange={(v) => setValue("toWarehouseId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih gudang tujuan" />
                </SelectTrigger>
                <SelectContent>
                  {warehouseOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.toWarehouseId && (
                <p className="text-sm text-destructive">{errors.toWarehouseId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Jumlah</Label>
              <Input id="quantity" type="number" min={1} {...register("quantity")} />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea id="notes" {...register("notes")} rows={3} placeholder="Catatan transfer (opsional)" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Buat Transfer"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

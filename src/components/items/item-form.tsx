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
import { createItem, updateItem } from "@/actions/item.actions"
import type { ItemType } from "@prisma/client"

const itemFormSchema = z.object({
  itemCode: z.string().min(1, "Kode item wajib diisi"),
  itemName: z.string().min(1, "Nama item wajib diisi"),
  itemType: z.enum(["INVENTORY", "NON_INVENTORY", "SERVICE"]),
  description: z.string().optional(),
  unitPrice: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0),
  unit: z.string().min(1, "Satuan wajib diisi"),
  category: z.string().optional(),
})

type ItemFormValues = z.infer<typeof itemFormSchema>

const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  INVENTORY: "Persediaan",
  NON_INVENTORY: "Non-Persediaan",
  SERVICE: "Jasa",
}

interface ItemFormProps {
  defaultValues?: Partial<ItemFormValues>
  itemId?: string
}

export function ItemForm({ defaultValues, itemId }: ItemFormProps) {
  const router = useRouter()
  const isEdit = Boolean(itemId)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      itemCode: "",
      itemName: "",
      itemType: "INVENTORY",
      description: "",
      unitPrice: 0,
      costPrice: 0,
      unit: "pcs",
      category: "",
      ...defaultValues,
    },
  })

  const itemType = watch("itemType")

  async function onSubmit(data: ItemFormValues) {
    const payload = {
      ...data,
      description: data.description || undefined,
      category: data.category || undefined,
    }

    const result = isEdit
      ? await updateItem(itemId!, payload)
      : await createItem(payload)

    if (result.success) {
      toast.success(result.message)
      router.push(isEdit ? `/items/${itemId}` : `/items/${result.data.id}`)
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
              <Label htmlFor="itemCode">Kode Item</Label>
              <Input
                id="itemCode"
                {...register("itemCode")}
                placeholder="ITM-001"
                disabled={isEdit}
              />
              {errors.itemCode && (
                <p className="text-sm text-destructive">{errors.itemCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemName">Nama Item</Label>
              <Input id="itemName" {...register("itemName")} placeholder="Nama item" />
              {errors.itemName && (
                <p className="text-sm text-destructive">{errors.itemName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tipe Item</Label>
              <Select
                value={itemType}
                onValueChange={(v) => setValue("itemType", v as ItemType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ITEM_TYPE_LABELS) as ItemType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {ITEM_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.itemType && (
                <p className="text-sm text-destructive">{errors.itemType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Input id="category" {...register("category")} placeholder="Kategori" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice">Harga Jual</Label>
              <Input
                id="unitPrice"
                type="number"
                min={0}
                {...register("unitPrice")}
              />
              {errors.unitPrice && (
                <p className="text-sm text-destructive">{errors.unitPrice.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">Harga Pokok</Label>
              <Input
                id="costPrice"
                type="number"
                min={0}
                {...register("costPrice")}
              />
              {errors.costPrice && (
                <p className="text-sm text-destructive">{errors.costPrice.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Satuan</Label>
              <Input id="unit" {...register("unit")} placeholder="pcs" />
              {errors.unit && (
                <p className="text-sm text-destructive">{errors.unit.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Deskripsi item (opsional)"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Item"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

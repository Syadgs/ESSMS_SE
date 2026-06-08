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
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { createSupplier } from "@/actions/supplier.actions"

const supplierFormSchema = z.object({
  supplierCode: z.string().min(1, "Kode supplier wajib diisi"),
  supplierName: z.string().min(1, "Nama supplier wajib diisi"),
  contactPerson: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type SupplierFormValues = z.infer<typeof supplierFormSchema>

export function SupplierForm() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      supplierCode: "",
      supplierName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
    },
  })

  async function onSubmit(data: SupplierFormValues) {
    const result = await createSupplier({
      ...data,
      contactPerson: data.contactPerson || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
    })

    if (result.success) {
      toast.success(result.message)
      router.push(`/suppliers/${result.data.id}`)
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
              <Label htmlFor="supplierCode">Kode Supplier</Label>
              <Input id="supplierCode" {...register("supplierCode")} placeholder="SUP-001" />
              {errors.supplierCode && (
                <p className="text-sm text-destructive">{errors.supplierCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierName">Nama Supplier</Label>
              <Input id="supplierName" {...register("supplierName")} placeholder="Nama supplier" />
              {errors.supplierName && (
                <p className="text-sm text-destructive">{errors.supplierName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Kontak Person</Label>
              <Input id="contactPerson" {...register("contactPerson")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telepon</Label>
              <Input id="phone" {...register("phone")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea id="address" {...register("address")} rows={3} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Buat Supplier"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

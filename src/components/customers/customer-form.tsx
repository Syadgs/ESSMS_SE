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
import { createCustomer } from "@/actions/customer.actions"

const customerFormSchema = z.object({
  customerCode: z.string().min(1, "Code customer is required"),
  customerName: z.string().min(1, "Nama customer is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.coerce.number().min(0),
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

export function CustomerForm() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerCode: "",
      customerName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      creditLimit: 0,
    },
  })

  async function onSubmit(data: CustomerFormValues) {
    const result = await createCustomer({
      ...data,
      contactPerson: data.contactPerson || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
    })

    if (result.success) {
      toast.success(result.message)
      router.push(`/customers/${result.data.id}`)
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
              <Label htmlFor="customerCode">Code Customers</Label>
              <Input id="customerCode" {...register("customerCode")} placeholder="CUS-001" />
              {errors.customerCode && (
                <p className="text-sm text-destructive">{errors.customerCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Nama Customers</Label>
              <Input id="customerName" {...register("customerName")} placeholder="Nama customer" />
              {errors.customerName && (
                <p className="text-sm text-destructive">{errors.customerName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
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

            <div className="space-y-2">
              <Label htmlFor="creditLimit">Batas Kredit</Label>
              <Input id="creditLimit" type="number" min={0} {...register("creditLimit")} />
              {errors.creditLimit && (
                <p className="text-sm text-destructive">{errors.creditLimit.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea id="address" {...register("address")} rows={3} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Create Customers"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

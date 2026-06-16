"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { createUser } from "@/actions/user.actions"

const FormSchema = z.object({
  name: z.string().min(2, "Nama at least 2 characters"),
  email: z.string().email("Invalid email format"),
  role: z.string().min(1, "Role must be selected"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const ROLES = [
  { value: "PURCHASING_MANAGER", label: "Purchasing Manager" },
  { value: "INVENTORY_MANAGER", label: "Inventory Manager" },
  { value: "SALES_REP", label: "Sales Representative" },
  { value: "SALES_MANAGER", label: "Sales Manager" },
  { value: "ACCOUNTING_MANAGER", label: "Accounting Manager" },
  { value: "AP_ANALYST", label: "AP Analyst" },
  { value: "AR_ANALYST", label: "AR Analyst" },
  { value: "ADMIN", label: "Administrator" },
]

export function CreateUserForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true)
    try {
      const result = await createUser(data as never)
      if (result.success) {
        toast.success(result.message)
        router.push("/admin/users")
      } else {
        toast.error(result.error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div className="space-y-1.5">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" {...register("name")} placeholder="Nama pengguna" />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} placeholder="email@perusahaan.com" />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="role">Role</Label>
        <Select onValueChange={(val) => setValue("role", val)}>
          <SelectTrigger id="role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} placeholder="At least 6 characters" />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create Users"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

"use client"

import { useState, useTransition } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Package } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@essms.com", password: "password123" },
  })

  const onSubmit = (data: LoginForm) => {
    setError("")
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email atau password salah")
        toast.error("Login gagal")
        return
      }

      toast.success("Login berhasil")
      router.push("/dashboard")
      router.refresh()
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-navy-900 text-white">
            <Package className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-serif">ESSMS</CardTitle>
          <CardDescription>Enterprise Supply Chain & Sales Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@essms.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Masuk..." : "Masuk"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Demo: admin@essms.com / password123
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

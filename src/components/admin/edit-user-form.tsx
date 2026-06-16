"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateUser, deactivateUser } from "@/actions/user.actions"

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

interface EditUserFormProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
  }
}

export function EditUserForm({ user }: EditUserFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(user.name)
  const [role, setRole] = useState(user.role)
  const [isActive, setIsActive] = useState(user.isActive)
  const [password, setPassword] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await updateUser(user.id, {
        name,
        role: role as never,
        isActive,
        password: password || undefined,
      })
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

  async function handleDeactivate() {
    if (!confirm("Are you sure you want to deactivate this user?")) return
    const result = await deactivateUser(user.id)
    if (result.success) {
      toast.success(result.message)
      router.push("/admin/users")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-1.5">
        <Label>Email (cannot be changed)</Label>
        <Input value={user.email} disabled className="bg-muted" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-name">Full Name</Label>
        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-role">Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id="edit-role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="edit-active" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="edit-active">Users Active</Label>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
        <Input
          id="edit-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        {user.isActive && (
          <Button
            type="button"
            variant="destructive"
            className="ml-auto"
            onClick={handleDeactivate}
          >
            Inactivekan
          </Button>
        )}
      </div>
    </form>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createWarehouse } from "@/actions/warehouse.actions"

export function CreateWarehouseForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await createWarehouse({ warehouseCode: code, warehouseName: name, location })
      if (result.success) {
        toast.success(result.message)
        router.push("/admin/warehouses")
      } else {
        toast.error(result.error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-1.5">
        <Label htmlFor="wh-code">Code Warehouses</Label>
        <Input id="wh-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="WH-003" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="wh-name">Nama Warehouses</Label>
        <Input id="wh-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Warehouses Cabang Bandung" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="wh-location">Lokasi</Label>
        <Input id="wh-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kota / Alamat" />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Create Warehouses"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}

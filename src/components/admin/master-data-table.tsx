"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createDepartment, updateDepartment, createClass, updateClass } from "@/actions/department-class.actions"
import { useRouter } from "next/navigation"

interface MasterItem {
  id: string
  code: string
  name: string
  isActive: boolean
}

interface MasterDataTableProps {
  type: "department" | "class"
  items: MasterItem[]
}

export function MasterDataTable({ type, items: initialItems }: MasterDataTableProps) {
  const router = useRouter()
  const [newCode, setNewCode] = useState("")
  const [newName, setNewName] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!newCode || !newName) return toast.error("Code and name are required")
    setLoading(true)
    try {
      const result = type === "department"
        ? await createDepartment({ code: newCode, name: newName })
        : await createClass({ code: newCode, name: newName })
      if (result.success) {
        toast.success(result.message)
        setNewCode("")
        setNewName("")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(item: MasterItem) {
    const result = type === "department"
      ? await updateDepartment(item.id, { code: item.code, name: item.name, isActive: !item.isActive })
      : await updateClass(item.id, { code: item.code, name: item.name, isActive: !item.isActive })
    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Code (contoh: DEPT-001)"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          className="w-32"
        />
        <Input
          placeholder="Nama"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleCreate} size="sm" disabled={loading}>
          Add
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-xs">{item.code}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                {item.isActive ? (
                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">Active</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600 border-gray-300 text-xs">Inactive</Badge>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleToggleActive(item)}
                >
                  {item.isActive ? "Inactivekan" : "Activekan"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

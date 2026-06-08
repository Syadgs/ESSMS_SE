"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { completeTransfer, cancelTransfer } from "@/actions/inventory.actions"
import { useState } from "react"

interface TransferActionsProps {
  transferId: string
}

export function TransferActions({ transferId }: TransferActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<"complete" | "cancel" | null>(null)

  async function handleComplete() {
    setLoading("complete")
    const result = await completeTransfer(transferId)
    setLoading(null)

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function handleCancel() {
    setLoading("cancel")
    const result = await cancelTransfer(transferId)
    setLoading(null)

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleComplete} disabled={loading !== null}>
        {loading === "complete" ? "Memproses..." : "Selesaikan Transfer"}
      </Button>
      <Button variant="outline" onClick={handleCancel} disabled={loading !== null}>
        {loading === "cancel" ? "Memproses..." : "Batalkan"}
      </Button>
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { ActionResult } from "@/types"

interface RejectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  action: (note: string) => Promise<ActionResult>
  noteLabel?: string
}

export function RejectDialog({
  open,
  onOpenChange,
  title,
  description,
  action,
  noteLabel = "Alasan penolakan",
}: RejectDialogProps) {
  const router = useRouter()
  const [note, setNote] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleReject() {
    if (!note.trim()) {
      toast.error("Alasan penolakan wajib diisi")
      return
    }
    startTransition(async () => {
      const result = await action(note)
      if (result.success) {
        toast.success(result.message)
        onOpenChange(false)
        setNote("")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reject-note">{noteLabel}</Label>
          <Textarea
            id="reject-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Jelaskan alasan penolakan..."
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleReject} disabled={isPending}>
            {isPending ? "Memproses..." : "Tolak"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

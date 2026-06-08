"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  onCancel?: () => void
  variant?: "danger" | "warning" | "default"
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
}

const VARIANT_STYLES = {
  danger: "bg-destructive hover:bg-destructive/90",
  warning: "bg-amber-500 hover:bg-amber-600 text-white",
  default: "",
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  variant = "default",
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.()
              onOpenChange(false)
            }}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            className={cn(VARIANT_STYLES[variant])}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Memproses..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

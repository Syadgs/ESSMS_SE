"use client"

import { useState, useCallback } from "react"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

type ConfirmOptions = {
  title: string
  description: string
  variant?: "danger" | "warning" | "default"
  confirmLabel?: string
}

export function useConfirm() {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null)
  const [loading, setLoading] = useState(false)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts)
    setOpen(true)
    return new Promise((resolve) => {
      setResolveRef(() => resolve)
    })
  }, [])

  const handleConfirm = () => {
    resolveRef?.(true)
    setOpen(false)
    setResolveRef(null)
  }

  const handleCancel = () => {
    resolveRef?.(false)
    setResolveRef(null)
  }

  const ConfirmDialogComponent = options ? (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      title={options.title}
      description={options.description}
      variant={options.variant}
      confirmLabel={options.confirmLabel}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      loading={loading}
    />
  ) : null

  return { confirm, setLoading, ConfirmDialog: ConfirmDialogComponent }
}

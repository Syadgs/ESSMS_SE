"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import type { ActionResult } from "@/types"
import { cn } from "@/lib/utils"

interface ActionButtonProps {
  label: string
  action: () => Promise<ActionResult>
  variant?: "default" | "destructive" | "outline" | "secondary"
  className?: string
  disabled?: boolean
}

export function ActionButton({
  label,
  action,
  variant = "default",
  className,
  disabled,
}: ActionButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await action()
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      disabled={disabled || isPending}
      className={cn(className)}
    >
      {isPending ? "Memproses..." : label}
    </Button>
  )
}

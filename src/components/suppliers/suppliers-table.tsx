"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export type SupplierRow = {
  id: string
  supplierCode: string
  supplierName: string
  contactPerson: string | null
  email: string | null
  phone: string | null
}

const columns: ColumnDef<SupplierRow>[] = [
  {
    accessorKey: "supplierCode",
    header: "Code Supplier",
    cell: ({ row }) => (
      <Link href={`/suppliers/${row.original.id}`} className="doc-number hover:underline">
        {row.original.supplierCode}
      </Link>
    ),
  },
  {
    accessorKey: "supplierName",
    header: "Nama Supplier",
  },
  {
    accessorKey: "contactPerson",
    header: "Contact",
    cell: ({ row }) => row.original.contactPerson ?? "-",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email ?? "-",
  },
  {
    accessorKey: "phone",
    header: "Telepon",
    cell: ({ row }) => row.original.phone ?? "-",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/suppliers/${row.original.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
    ),
  },
]

interface SuppliersTableProps {
  data: SupplierRow[]
}

export function SuppliersTable({ data }: SuppliersTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="supplierName"
      searchPlaceholder="Search supplier..."
      emptyTitle="No supplier"
      emptyDescription="Start by adding supplier"
    />
  )
}

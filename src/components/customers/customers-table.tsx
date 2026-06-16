"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Eye } from "lucide-react"

export type CustomerRow = {
  id: string
  customerCode: string
  customerName: string
  contactPerson: string | null
  email: string | null
  phone: string | null
  creditLimit: number
}

const columns: ColumnDef<CustomerRow>[] = [
  {
    accessorKey: "customerCode",
    header: "Code Customers",
    cell: ({ row }) => (
      <Link href={`/customers/${row.original.id}`} className="doc-number hover:underline">
        {row.original.customerCode}
      </Link>
    ),
  },
  {
    accessorKey: "customerName",
    header: "Nama Customers",
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
    accessorKey: "creditLimit",
    header: "Batas Kredit",
    cell: ({ row }) => formatCurrency(row.original.creditLimit),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/customers/${row.original.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
    ),
  },
]

interface CustomersTableProps {
  data: CustomerRow[]
}

export function CustomersTable({ data }: CustomersTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="customerName"
      searchPlaceholder="Search customer..."
      emptyTitle="No customer"
      emptyDescription="Start by adding customer"
    />
  )
}

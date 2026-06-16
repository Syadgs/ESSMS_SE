"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate } from "@/lib/utils"

export type ShipmentRow = {
  id: string
  shipmentNumber: string
  soNumber: string
  customerName: string
  carrier: string | null
  shipDate: string
  status: string
}

const columns: ColumnDef<ShipmentRow>[] = [
  {
    accessorKey: "shipmentNumber",
    header: "No. Shipment",
    cell: ({ row }) => (
      <Link href={`/shipments/${row.original.id}`} className="doc-number hover:underline">
        {row.original.shipmentNumber}
      </Link>
    ),
  },
  { accessorKey: "soNumber", header: "No. SO" },
  { accessorKey: "customerName", header: "Customer" },
  { accessorKey: "carrier", header: "Kurir" },
  {
    accessorKey: "shipDate",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.shipDate),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
]

export function ShipmentsTable({ data }: { data: ShipmentRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="shipmentNumber"
      searchPlaceholder="Search shipment..."
      emptyTitle="No Shipment"
    />
  )
}

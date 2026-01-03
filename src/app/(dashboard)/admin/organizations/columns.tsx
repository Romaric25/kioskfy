"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

import { Organization } from "@/server/models/organization.model"

export const columns: ColumnDef<Organization>[] = [
    {
        accessorKey: "logo",
        header: "Logo",
        cell: ({ row }) => {
            const logo = row.original.logo
            const name = row.original.name
            return (
                <Avatar className="rounded-md">
                    <AvatarImage src={logo || ""} alt={name} />
                    <AvatarFallback className="rounded-md">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            )
        },
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nom
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "phone",
        header: "Téléphone",
        cell: ({ row }) => row.getValue("phone") || "-",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "createdAt",
        header: "Créé le",
        cell: ({ row }) => {
            return new Date(row.getValue("createdAt")).toLocaleDateString("fr-FR")
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const organization = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/organizations/${organization.id}/newspapers`}>
                                Afficher ses journaux
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/organizations/${organization.id}`}>
                                Voir les détails
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Suspendre</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

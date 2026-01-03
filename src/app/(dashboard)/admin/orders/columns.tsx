"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { priceFormatter } from "@/lib/price-formatter"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AdminOrderResponse } from "@/app/interfaces/order.interface"

export const columns: ColumnDef<AdminOrderResponse>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Tout sélectionner"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Sélectionner la ligne"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <div className="w-[60px] truncate text-xs text-muted-foreground" title={row.getValue("id")}>{row.getValue("id")}</div>,
    },
    {
        accessorKey: "user",
        header: "Utilisateur",
        cell: ({ row }) => {
            const user = row.original.user;
            if (!user) return <span className="text-muted-foreground italic">Inconnu</span>;

            return (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                        <AvatarFallback>{user.name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "newspaper",
        header: "Journal",
        cell: ({ row }) => {
            const newspaper = row.original.newspaper;
            if (!newspaper) return <span className="text-muted-foreground italic">Supprimé</span>;

            return (
                <div className="flex items-center gap-2 max-w-[200px]">
                    <img
                        src={newspaper.coverImage}
                        alt={`Journal #${newspaper.issueNumber}`}
                        className="h-10 w-8 object-cover rounded border"
                    />
                    <div className="flex flex-col truncate">
                        <span className="font-medium text-sm">#{newspaper.issueNumber}</span>
                        <span className="text-xs text-muted-foreground truncate">{newspaper.organization?.name}</span>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "price",
        header: "Montant",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("price"))
            return <div className="font-medium">{priceFormatter(amount)}</div>
        },
    },
    {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => {
            const status = row.getValue("status") as string

            let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
            let label = status
            let className = ""

            switch (status) {
                case "completed":
                    label = "Payé"
                    className = "bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200"
                    break
                case "pending":
                    variant = "secondary"
                    label = "En attente"
                    className = "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 border-yellow-200"
                    break
                case "failed":
                    variant = "destructive"
                    label = "Échoué"
                    break
                case "refunded":
                    variant = "outline"
                    label = "Remboursé"
                    break
            }

            return <Badge variant={variant as any} className={className}>{label}</Badge>
        },
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => {
            const date = new Date(row.original.createdAt)
            return <div className="text-sm text-muted-foreground">
                {format(date, "dd MMM yyyy HH:mm", { locale: fr })}
            </div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const order = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(order.id)}
                        >
                            Copier ID commande
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {order.userId && (
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.userId!)}>
                                Copier ID utilisateur
                            </DropdownMenuItem>
                        )}
                        {order.paymentId && (
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.paymentId!)}>
                                Copier ID paiement
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

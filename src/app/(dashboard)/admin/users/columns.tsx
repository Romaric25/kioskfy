"use client"

import { useState } from "react"
import { ColumnDef, Row } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Check, X, Loader2, Shield, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useAssignRole } from "@/hooks/use-users.hook"
import toast from "react-hot-toast"
import Link from "next/link"

export interface UserTableData {
    id: string
    name: string
    lastName: string
    email: string
    image?: string | null
    phone?: string
    typeUser?: string
    role?: string
    emailVerified: boolean
    createdAt: Date
}

const AVAILABLE_ROLES = [
    { value: "user", label: "Utilisateur", description: "Accès standard" },
    { value: "moderator", label: "Modérateur", description: "Gestion des utilisateurs" },
    { value: "admin", label: "Administrateur", description: "Gestion du contenu" },
    { value: "superadmin", label: "Super Admin", description: "Accès complet" },
] as const

const UserActions = ({ row }: { row: Row<UserTableData> }) => {
    const user = row.original
    const router = useRouter()
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState<string>(user.role || "user")

    const { assignRole, isAssigningRole } = useAssignRole({
        onSuccess: () => {
            toast.success("Rôle attribué avec succès")
            setIsRoleDialogOpen(false)
            router.refresh()
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })

    const handleConfirmRole = () => {
        if (selectedRole) {
            assignRole({ userId: user.id, role: selectedRole })
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setIsRoleDialogOpen(true)}>
                        <Shield className="mr-2 h-4 w-4" />
                        Assigner un rôle
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${user.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir le profil
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Bannir l'utilisateur</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assigner un rôle</DialogTitle>
                        <DialogDescription>
                            Modifier le rôle de <span className="font-medium">{user.name} {user.lastName}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionner un rôle" />
                            </SelectTrigger>
                            <SelectContent>
                                {AVAILABLE_ROLES.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{role.label}</span>
                                            <span className="text-xs text-muted-foreground">{role.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsRoleDialogOpen(false)}
                            disabled={isAssigningRole}
                        >
                            Annuler
                        </Button>
                        <Button onClick={handleConfirmRole} disabled={isAssigningRole}>
                            {isAssigningRole && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export const columns: ColumnDef<UserTableData>[] = [
    {
        accessorKey: "image",
        header: "Avatar",
        cell: ({ row }) => {
            const image = row.original.image
            const name = row.original.name
            const lastName = row.original.lastName
            return (
                <Avatar>
                    <AvatarImage src={image || ""} alt={name} />
                    <AvatarFallback>{(name?.slice(0, 1) || "") + (lastName?.slice(0, 1) || "").toUpperCase()}</AvatarFallback>
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
                    Prénom
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "lastName",
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
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "phone",
        header: "Téléphone",
        cell: ({ row }) => row.getValue("phone") || "-",
    },
    {
        accessorKey: "typeUser",
        header: "Type",
        cell: ({ row }) => <Badge variant="outline">{row.getValue("typeUser") || "User"}</Badge>,
    },
    {
        accessorKey: "role",
        header: "Rôle",
        cell: ({ row }) => {
            const role = row.getValue("role") as string | undefined
            const roleVariant = role === "admin" || role === "superadmin" ? "default" : "secondary"
            return <Badge variant={roleVariant}>{role || "user"}</Badge>
        },
    },
    {
        accessorKey: "emailVerified",
        header: "Email vérifié",
        cell: ({ row }) => {
            return row.getValue("emailVerified") ? (
                <Check className="h-4 w-4 text-green-500" />
            ) : (
                <X className="h-4 w-4 text-red-500" />
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Date d'inscription",
        cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
    },
    {
        id: "actions",
        cell: ({ row }) => <UserActions row={row} />,
    },
]

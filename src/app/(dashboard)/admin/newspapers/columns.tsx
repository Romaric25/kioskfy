"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NewspaperResponse, Status } from "@/server/models/newspaper.model"
import { priceFormatter } from "@/lib/price-formatter"
import { useRouter } from "next/navigation"
import { useSelectedNewspaperStore } from "@/stores/use-newspaper.store"
import { useUpdateNewspaperStatus } from "@/hooks/use-newspapers.hook"
import { toast } from "react-hot-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { useProjectPermission } from "@/hooks/use-project-permission.hook"
import { ProjectPermissions } from "@/lib/permissions"

const NewspaperActions = ({ newspaper }: { newspaper: NewspaperResponse }) => {
    const router = useRouter();
    const { setSelectedNewspaper } = useSelectedNewspaperStore();
    const { updateNewspaperStatus, isUpdatingNewspaperStatus } = useUpdateNewspaperStatus();
    const [showArchiveDialog, setShowArchiveDialog] = useState(false);
    const { hasPermission, isLoading } = useProjectPermission({
        permissions: { project: [ProjectPermissions.ARCHIVE] }
    });

    const viewNewspaper = (id: string) => {
        setSelectedNewspaper(id, "");
        router.push(`/admin/newspapers/render`);
    };

    const handleOpenArchiveDialog = () => {
        if (!hasPermission) {
            toast.error("Vous n'avez pas la permission d'archiver ce journal");
            return;
        }
        setShowArchiveDialog(true);
    };

    const handleArchive = async () => {
        if (!hasPermission) {
            toast.error("Vous n'avez pas la permission d'archiver ce journal");
            return;
        }
        try {
            await updateNewspaperStatus({ id: newspaper.id, status: Status.ARCHIVED });
            toast.success("Journal archivé avec succès");
            setShowArchiveDialog(false);
        } catch (error) {
            toast.error("Erreur lors de l'archivage du journal");
        }
    };

    const handlePublish = async () => {
        if (!hasPermission) {
            toast.error("Vous n'avez pas la permission de publier ce journal");
            return;
        }
        try {
            await updateNewspaperStatus({ id: newspaper.id, status: Status.PUBLISHED });
            toast.success("Journal publié avec succès");
        } catch (error) {
            toast.error("Erreur lors de la publication du journal");
        }
    };



    return (
        <>
            <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action archivera le journal. Il ne sera plus visible par les utilisateurs pour acheter.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault(); // Prevent auto-close
                                handleArchive();
                            }}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isUpdatingNewspaperStatus}
                        >
                            {isUpdatingNewspaperStatus ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Archivage...
                                </>
                            ) : (
                                "Archiver"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Ouvrir le menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => viewNewspaper(newspaper.id)}
                    >
                        Voir le journal
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {newspaper.status === Status.ARCHIVED ? (
                        <DropdownMenuItem
                            className="text-green-600 focus:text-green-600"
                            onClick={handlePublish}
                            disabled={isUpdatingNewspaperStatus || isLoading || !hasPermission}
                        >
                            {isUpdatingNewspaperStatus ? "Publication..." : "Publier"}
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={handleOpenArchiveDialog}
                            disabled={isUpdatingNewspaperStatus || isLoading || !hasPermission}
                        >
                            Archiver
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

export const columns: ColumnDef<NewspaperResponse>[] = [
    {
        accessorKey: "coverImage",
        header: "Couverture",
        cell: ({ row }) => {
            const cover = row.original.coverImage;
            const issue = row.original.issueNumber;
            return (
                <div className="h-10 w-10 overflow-hidden rounded-md bg-muted border">
                    {cover ? (
                        <img
                            src={cover}
                            alt={`Cover ${issue}`}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                            -
                        </div>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "issueNumber",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Numéro
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "organization",
        header: "Organisation",
        cell: ({ row }) => {
            const org = row.original.organization;
            if (!org) return <span className="text-muted-foreground">-</span>

            return (
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 rounded-md">
                        <AvatarImage src={org.logo || ""} alt={org.name} />
                        <AvatarFallback className="rounded-md">{org.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[150px]">{org.name}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            let variant: "default" | "secondary" | "destructive" | "outline" = "outline"

            switch (status) {
                case "published":
                    variant = "default"
                    break
                case "pending":
                    variant = "secondary"
                    break
                case "draft":
                    variant = "outline"
                    break
                case "archived":
                    variant = "secondary" // Or another visual cue
                    break
            }

            // Translate status for display
            const statusLabels: Record<string, string> = {
                published: "Publié",
                pending: "En attente",
                draft: "Brouillon",
                archived: "Archivé"
            }

            return <Badge variant={variant}>{statusLabels[status] || status}</Badge>
        },
    },
    {
        accessorKey: "price",
        header: "Prix",
        cell: ({ row }) => {
            const price = row.getValue("price");
            return priceFormatter(Number(price));
        },
    },
    {
        accessorKey: "salesCount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Ventes
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const sales = row.original.salesCount || 0;
            return <div className="pl-4">{sales}</div>
        },
    },
    {
        accessorKey: "publishDate",
        header: "Date de pub.",
        cell: ({ row }) => {
            return new Date(row.getValue("publishDate")).toLocaleDateString("fr-FR")
        },
    },
    {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => <NewspaperActions newspaper={row.original} />,
    },
]

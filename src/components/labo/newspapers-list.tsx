"use client";

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useNewspapersByOrganization, useUpdateNewspaper, useUpdateNewspaperStatus } from "@/hooks/use-newspapers.hook";

import { Badge } from "@/components/ui/badge";
import { priceFormatter, formatDate } from "@/lib/helpers";
import Image from "next/image";
import { NewspapersListSkeleton } from "./skeleton/newspapers-list-skeleton";
import {
    FileText,
    MoreHorizontal,
    Globe,
    Archive,
    Search,
    Pencil,
    Loader2,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditNewspaperSheet } from "./edit-newspaper-sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useSelectedNewspaperStore } from "@/stores/use-newspaper.store";
import { NewspaperResponse, Status } from "@/server/models/newspaper.model";
import { useActiveOrganization } from "@/hooks";

export function NewspapersList() {
    const { organisation } = useActiveOrganization();
    const router = useRouter();
    const { setSelectedNewspaper } = useSelectedNewspaperStore();

    // Extract organization ID from Better-Auth's organization structure
    const organizationId = organisation?.data?.id?.toString() || "";
    const { newspapers, newspapersLoading } = useNewspapersByOrganization(organizationId, { includeAllStatuses: true });
    const { updateNewspaper, isUpdatingNewspaper, isUpdatingNewspaperSuccess } =
        useUpdateNewspaper();
    const { updateNewspaperStatus, isUpdatingNewspaperStatus, isUpdatingNewspaperStatusSuccess } =
        useUpdateNewspaperStatus();

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [editingNewspaper, setEditingNewspaper] = useState<NewspaperResponse | null>(
        null
    );
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        isOpen: boolean;
        newspaperId: string;
        newStatus: Status;
        actionType: "publish" | "archive";
    } | null>(null);

    const closeConfirmDialog = () => {
        setConfirmAction(null);
    };

    useEffect(() => {
        if (isUpdatingNewspaperStatusSuccess) {
            toast.success("Statut mis à jour avec succès");
            closeConfirmDialog();
        }
    }, [isUpdatingNewspaperStatusSuccess]);

    const handleEditNewspaper = (newspaper: NewspaperResponse) => {
        setEditingNewspaper(newspaper);
        setIsEditSheetOpen(true);
    };

    const openConfirmDialog = (
        newspaperId: string,
        newStatus: Status,
        actionType: "publish" | "archive"
    ) => {
        setConfirmAction({
            isOpen: true,
            newspaperId,
            newStatus,
            actionType,
        });
    };

    const confirmStatusChange = async () => {
        if (!confirmAction) return;
        console.log("confirmAction", confirmAction);
        await handleStatusChange(
            confirmAction.newspaperId,
            confirmAction.newStatus
        );
    };

    const handleStatusChange = async (id: string, newStatus: Status) => {
        try {
            const result = await updateNewspaperStatus({
                id: id,
                status: newStatus,
            });
            console.log("Status update result:", result);
        } catch (error) {
            console.error("Status update error:", error);
            toast.error("Erreur lors de la mise à jour du statut");
        }
    };

    const viewNewspaper = (id: string) => {
        setSelectedNewspaper(id, "");
        router.push(`/organization/render`);
    };

    const columns: ColumnDef<NewspaperResponse>[] = [
        {
            accessorKey: "coverImage",
            header: "Couverture",
            cell: ({ row }) => (
                <div className="relative h-16 w-12 overflow-hidden rounded-md border">
                    {row.original.coverImage ? (
                        <Image
                            src={row.original.coverImage}
                            alt={`Couverture ${row.original.issueNumber}`}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            N/A
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "issueNumber",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="-ml-3 h-8 hover:bg-accent/50"
                    >
                        Numéro
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-medium">{row.getValue("issueNumber")}</div>,
        },
        {
            accessorKey: "publishDate",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="-ml-3 h-8 hover:bg-accent/50"
                    >
                        Date de publication
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const date = row.getValue("publishDate");
                return date ? formatDate(date as string | Date, "fr") : "N/A";
            },
        },
        {
            accessorKey: "status",
            header: "Statut",
            cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
            filterFn: (row, id, value) => {
                return value === "all" ? true : row.getValue(id) === value;
            },
        },
        {
            accessorKey: "price",
            header: "Prix",
            cell: ({ row }) => priceFormatter(Number(row.getValue("price")), "XAF", "fr"),
        },
        {
            id: "pdf",
            header: "PDF",
            cell: ({ row }) => {
                const newspaper = row.original;
                return newspaper?.pdf ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewNewspaper(newspaper.id)}
                        className="flex items-center gap-2 h-8"
                    >
                        <FileText className="h-4 w-4" />
                        Aperçu
                    </Button>
                ) : (
                    <span className="text-muted-foreground text-xs">N/A</span>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const newspaper = row.original;
                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Ouvrir le menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditNewspaper(newspaper)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        openConfirmDialog(
                                            newspaper.id,
                                            Status.PUBLISHED,
                                            "publish"
                                        )
                                    }
                                    disabled={isUpdatingNewspaperStatus || newspaper.status === Status.PUBLISHED}
                                    className="text-green-600 focus:text-green-700 focus:bg-green-50"
                                >
                                    <Globe className="mr-2 h-4 w-4" />
                                    Publier
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={() =>
                                        openConfirmDialog(
                                            newspaper.id,
                                            Status.ARCHIVED,
                                            "archive"
                                        )
                                    }
                                    disabled={
                                        newspaper.status === Status.ARCHIVED || isUpdatingNewspaperStatus
                                    }
                                    className="text-orange-600 focus:text-orange-700 focus:bg-orange-50"
                                >
                                    <Archive className="mr-2 h-4 w-4" />
                                    Archiver
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: (newspapers?.data ?? []) as NewspaperResponse[],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
    });

    if (newspapersLoading) {
        return <NewspapersListSkeleton />;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par numéro..."
                        value={(table.getColumn("issueNumber")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("issueNumber")?.setFilterValue(event.target.value)
                        }
                        className="pl-8"
                    />
                </div>
                <Select
                    value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
                    onValueChange={(value) =>
                        table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
                    }
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value={Status.PUBLISHED}>Publié</SelectItem>
                        <SelectItem value={Status.DRAFT}>Brouillon</SelectItem>
                        <SelectItem value={Status.ARCHIVED}>Archivé</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Aucun journal trouvé.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>


            <EditNewspaperSheet
                newspaper={editingNewspaper}
                open={isEditSheetOpen}
                onOpenChange={setIsEditSheetOpen}
            />

            {/* Confirmation Dialog */}
            <AlertDialog open={confirmAction?.isOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmAction?.actionType === "publish"
                                ? "Confirmer la publication"
                                : "Confirmer l'archivage"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction?.actionType === "publish"
                                ? "Êtes-vous sûr de vouloir publier ce journal ? Il sera visible par tous les utilisateurs."
                                : "Êtes-vous sûr de vouloir archiver ce journal ? Il ne sera plus visible par les utilisateurs."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUpdatingNewspaperStatus} onClick={closeConfirmDialog}>
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmStatusChange}
                            disabled={isUpdatingNewspaperStatus}
                            className={
                                confirmAction?.actionType === "publish"
                                    ? "bg-green-600 hover:bg-green-700 text-white focus:ring-green-600"
                                    : "bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-600"
                            }
                        >
                            {isUpdatingNewspaperStatus ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mise à jour...
                                </>
                            ) : confirmAction?.actionType === "publish" ? (
                                "Publier"
                            ) : (
                                "Archiver"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function StatusBadge({ status }: { status: "pending" | "published" | "draft" | "archived" }) {
    if (status === Status.PUBLISHED) {
        return <Badge variant="default">Publié</Badge>;
    }

    if (status === Status.DRAFT) {
        return <Badge variant="secondary">Brouillon</Badge>;
    }

    if (status === Status.ARCHIVED) {
        return <Badge variant="outline">Archivé</Badge>;
    }

    return <Badge variant="default">{status}</Badge>;
}

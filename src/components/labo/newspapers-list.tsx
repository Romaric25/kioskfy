"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAllNewspapers, useNewspapersByOrganization, useUpdateNewspaper } from "@/hooks/use-newspapers.hook";

import { Badge } from "@/components/ui/badge";
import { priceFormatter } from "@/lib/helpers";
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
import { formatDate } from "@/lib/helpers";
import { NewspaperResponse, Status } from "@/server/models/newspaper.model";
import { useActiveOrganization } from "@/hooks";

export function NewspapersList() {
    const { organisation } = useActiveOrganization();
    const router = useRouter();
    const { selectedNewspaperId, setSelectedNewspaper } =
        useSelectedNewspaperStore();

    // Extract organization ID from Better-Auth's organization structure
    const organizationId = organisation?.data?.id?.toString() || "";
    const { newspapers, newspapersLoading } = useNewspapersByOrganization(organizationId);
    const { updateNewspaper, isUpdatingNewspaper, isUpdatingNewspaperSuccess } =
        useUpdateNewspaper();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
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
        if (isUpdatingNewspaperSuccess) {
            toast.success("Statut mis à jour avec succès");
            closeConfirmDialog();
        }
    }, [isUpdatingNewspaperSuccess]);

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
            await updateNewspaper({
                id: Number(id),
                data: { status: newStatus },
            });

        } catch (error) {
            toast.error("Erreur lors de la mise à jour du statut");
        }
    };

    const filteredNewspapers = newspapers?.data?.filter((newspaper) => {
        const matchesSearch = newspaper.issueNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || newspaper.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (newspapersLoading) {
        return <NewspapersListSkeleton />;
    }

    if (!newspapers || newspapers?.data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">Aucun journal trouvé</p>
            </div>
        );
    }

    const viewNewspaper = (id: string) => {
        setSelectedNewspaper(id, "");
        router.push(`/organization/render`);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par numéro..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                        <TableRow>
                            <TableHead>Couverture</TableHead>
                            <TableHead>Numéro</TableHead>
                            <TableHead>Date de publication</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Prix</TableHead>
                            <TableHead>PDF</TableHead>
                            <TableHead className="w-[70px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredNewspapers?.map((newspaper) => (
                            <TableRow key={newspaper.id}>
                                <TableCell>
                                    <div className="relative h-16 w-12 overflow-hidden rounded-md border">
                                        {newspaper.coverImage ? (
                                            <Image
                                                src={newspaper.coverImage}
                                                alt={`Couverture ${newspaper.issueNumber}`}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                                N/A
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {newspaper.issueNumber}
                                </TableCell>
                                <TableCell>
                                    {formatDate(newspaper.publishDate, "fr")}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={newspaper.status} />
                                </TableCell>
                                <TableCell>
                                    {priceFormatter(
                                        Number(newspaper.price),
                                        "XAF",
                                        "fr"
                                    )}
                                </TableCell>
                                <TableCell>
                                    {newspaper?.pdf ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => viewNewspaper(newspaper.id)}
                                        >
                                            <FileText className="h-4 w-4" />
                                            Aperçu
                                        </Button>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">N/A</span>
                                    )}
                                </TableCell>
                                <TableCell>
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
                                                onClick={() =>
                                                    handleEditNewspaper(newspaper)
                                                }
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Modifier
                                            </DropdownMenuItem>
                                            {newspaper.status === Status.DRAFT && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        openConfirmDialog(
                                                            newspaper.id,
                                                            Status.PUBLISHED,
                                                            "publish"
                                                        )
                                                    }
                                                    disabled={isUpdatingNewspaper}
                                                    className="text-green-600 focus:text-green-700 focus:bg-green-50"
                                                >
                                                    <Globe className="mr-2 h-4 w-4" />
                                                    Publier
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuItem
                                                onClick={() =>
                                                    openConfirmDialog(
                                                        newspaper.id,
                                                        Status.ARCHIVED,
                                                        "archive"
                                                    )
                                                }
                                                disabled={
                                                    newspaper.status === Status.ARCHIVED ||
                                                    isUpdatingNewspaper
                                                }
                                                className="text-orange-600 focus:text-orange-700 focus:bg-orange-50"
                                            >
                                                <Archive className="mr-2 h-4 w-4" />
                                                Archiver
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <EditNewspaperSheet
                newspaper={editingNewspaper}
                open={isEditSheetOpen}
                onOpenChange={setIsEditSheetOpen}
            />

            {/* Confirmation Dialog */}
            <AlertDialog
                open={confirmAction?.isOpen}
            >
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
                        <AlertDialogCancel disabled={isUpdatingNewspaper}>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmStatusChange}
                            disabled={isUpdatingNewspaper}
                            className={
                                confirmAction?.actionType === "publish"
                                    ? "bg-green-600 hover:bg-green-700 text-white focus:ring-green-600"
                                    : "bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-600"
                            }
                        >
                            {isUpdatingNewspaper ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mise à jour...
                                </>
                            ) : (
                                confirmAction?.actionType === "publish"
                                    ? "Publier"
                                    : "Archiver"
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

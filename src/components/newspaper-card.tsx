"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Calendar, ShoppingBag, Eye, Heart, Trash2 } from "lucide-react";
import { NewspaperResponse } from "@/server/models/newspaper.model";
import { formatDate } from "@/lib/helpers";
import { priceFormatter } from "@/lib/price-formatter";
import { Badge } from "./ui/badge";
import { useCheckFavorite, useToggleFavorite } from "@/hooks/use-favorites.hook";
import { useAuth } from "@/hooks/use-auth.hook";
import { useCartStore } from "@/stores/cart.store";
import toast from "react-hot-toast";

interface NewspaperCardProps {
    newspaper: NewspaperResponse;
}

export function NewspaperCard({ newspaper }: NewspaperCardProps) {
    const title = newspaper.issueNumber;
    const agencyName = newspaper.organization?.name || "";
    const date = formatDate(newspaper.publishDate, "fr", "d MMM yyyy");
    const price = priceFormatter(
        newspaper.price,
        newspaper.country?.currency || "EUR",
        newspaper.country?.code || "fr-FR"
    );
    const coverImage = newspaper.coverImage || "/placeholder.jpg";

    const { isAuthenticated } = useAuth();
    const { isFavorite } = useCheckFavorite(newspaper.id, isAuthenticated);
    const toggleFavorite = useToggleFavorite();

    const items = useCartStore((state) => state.items);
    const { addItem, removeItem } = useCartStore();
    const inCart = items.some((item) => item.id === newspaper.id);

    const handleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error("Connectez-vous pour ajouter aux favoris");
            return;
        }
        toggleFavorite.mutate(newspaper.id);
    };

    const handleCartAction = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (inCart) {
            removeItem(newspaper.id);
            toast.success("Retiré du panier");
        } else {
            addItem(newspaper);
            toast.success("Ajouté au panier");
        }
    };

    return (
        <article className="group relative flex flex-col gap-4">
            {/* Zone de couverture avec effet 3D */}
            <div className="relative aspect-[3/4] w-full [perspective:1000px]">
                <Link href={`/newspapers/${newspaper.id}`} className="block h-full w-full">
                    <div className="relative h-full w-full transition-all duration-500 ease-out [transform-style:preserve-3d] group-hover:-translate-y-2 group-hover:[transform:rotateX(5deg)] group-hover:shadow-2xl rounded-lg">

                        {/* Ombre portée réaliste */}
                        <div className="absolute -bottom-4 left-4 right-4 h-4 bg-black/20 blur-xl rounded-[100%] transition-all duration-500 group-hover:bg-black/30 group-hover:blur-2xl" />

                        {/* Conteneur Image */}
                        <div className="relative h-full w-full overflow-hidden rounded-lg bg-background border border-border/40 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                            {/* Badge Pays */}
                            <div className="absolute top-3 left-3 z-20">
                                <Badge variant="secondary" className="bg-white/90 dark:bg-black/80 backdrop-blur shadow-sm border-0 gap-1.5 pl-1.5 pr-2.5 h-7">
                                    {newspaper.country?.flag && (
                                        <Image src={newspaper.country.flag} alt={newspaper.country?.name || "Pays"} width={16} height={16} className="rounded-full object-cover" />
                                    )}
                                    <span className="font-medium text-xs text-foreground/80">{newspaper.country?.name}</span>
                                </Badge>
                            </div>

                            {/* Bouton Favori - Toujours visible en haut à droite */}
                            <div className="absolute top-3 right-3 z-20">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleFavorite}
                                    disabled={toggleFavorite.isPending}
                                    className={`h-8 w-8 rounded-full backdrop-blur shadow-sm transition-all duration-200 ${isFavorite
                                        ? "bg-red-500 hover:bg-red-600 text-white"
                                        : "bg-white/90 dark:bg-black/80 hover:bg-red-50 hover:text-red-500"
                                        }`}
                                    title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                                >
                                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                                </Button>
                            </div>

                            {/* Badge Prix - Flottant en bas à droite */}
                            <div className="absolute bottom-3 right-3 z-20">
                                <Badge className="bg-primary hover:bg-primary shadow-lg border-0 h-8 px-3 text-sm font-bold">
                                    {price}
                                </Badge>
                            </div>

                            {coverImage && coverImage !== "/placeholder.jpg" ? (
                                <>
                                    <Image
                                        src={coverImage}
                                        alt={`Couverture ${title}`}
                                        fill
                                        className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                                    />
                                    {/* Glass sheen effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </>
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center bg-muted text-muted-foreground p-4 text-center">
                                    <span className="text-sm font-medium">Couverture non disponible</span>
                                </div>
                            )}

                            {/* Overlay Action au survol */}
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="rounded-full h-10 w-10 p-0 shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
                                    title="Voir le journal"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Informations sous la carte */}
            <div className="space-y-1.5 px-1">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                        <Link href={`/newspapers/${newspaper.id}`} className="block">
                            <h3 className="font-bold leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {agencyName}
                            </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground font-medium line-clamp-1">
                            {title}
                        </p>
                    </div>
                </div>

                <div className="flex items-center text-xs text-muted-foreground/80 font-medium">
                    <Calendar className="mr-1.5 h-3 w-3" />
                    {date}
                </div>

                <Button
                    size="sm"
                    variant={inCart ? "destructive" : "default"}
                    className="w-full mt-2"
                    onClick={handleCartAction}
                >
                    {inCart ? (
                        <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Retirer du panier
                        </>
                    ) : (
                        <>
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Acheter
                        </>
                    )}
                </Button>
            </div>
        </article>
    );
}

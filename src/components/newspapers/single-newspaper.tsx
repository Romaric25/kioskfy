"use client";

import { useParams } from "next/navigation";
import Image from "next/image";

import { useNewspaper } from "@/hooks/use-newspapers.hook";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, MapPinIcon, BuildingIcon, FileTextIcon, AlertCircleIcon, InfoIcon, ShoppingCart, Trash2, CalendarRange } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { useLocale } from "next-intl";
import { useCartStore } from "@/stores/cart.store";

import { NewspaperSkeleton } from "@/components/skeletons/newspaper-skeleton";
import { FrequencyContent } from "@/components/frequency-content";
import { priceFormatter } from "@/lib/price-formatter";


export const SingleNewspaper = () => {
    const { id } = useParams();
    const { newspaper, newspaperLoading, newspaperError } = useNewspaper(id as string);
    const items = useCartStore((state) => state.items);
    const { addItem, removeItem } = useCartStore();

    const inCart = newspaper ? items.some((item) => item.id === newspaper.id) : false;

    const handleCartAction = () => {
        if (!newspaper) return;
        if (inCart) {
            removeItem(newspaper.id);
        } else {
            addItem(newspaper);
        }
    };

    if (newspaperLoading) {
        return <NewspaperSkeleton />;
    }

    if (newspaperError) {
        return (
            <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to load newspaper details. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    if (!newspaper) {
        return (
            <Alert className="max-w-2xl mx-auto mt-8">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Not Found</AlertTitle>
                <AlertDescription>
                    This newspaper could not be found.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Column: Cover Image */}
                <div className="md:col-span-5 lg:col-span-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Card className="overflow-hidden border-2 shadow-lg cursor-zoom-in transition-transform hover:scale-[1.02] hover:shadow-xl group">
                                <div className="relative aspect-[3/4] w-full bg-muted">
                                    <Image
                                        src={newspaper.coverImage}
                                        alt={`Issue #${newspaper.issueNumber}`}
                                        fill
                                        className="object-cover transition-all group-hover:brightness-110"
                                        priority
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 33vw"
                                    />
                                </div>
                            </Card>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
                            <DialogTitle className="sr-only">
                                {newspaper.issueNumber} Cover
                            </DialogTitle>
                            <div className="relative w-full h-full">
                                <Image
                                    src={newspaper.coverImage}
                                    alt={`Issue #${newspaper.issueNumber} - Full Cover`}
                                    fill
                                    className="object-contain"
                                    sizes="90vw"
                                    priority
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Right Column: Details */}
                <div className="md:col-span-7 lg:col-span-8 space-y-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            {newspaper.categories?.map((cat) => (
                                <Badge key={cat.id} variant="outline">
                                    {cat.name}
                                </Badge>
                            ))}
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight mb-2">
                            {newspaper.issueNumber}
                        </h1>

                        <div className="flex items-center text-muted-foreground mb-6">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>{formatDate(newspaper.publishDate, "d MMM yyyy")}</span>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-muted-foreground flex items-center">
                                <BuildingIcon className="mr-2 h-4 w-4" />
                                Agence
                            </div>
                            <div className="font-medium">{newspaper.organization?.name ?? 'N/A'}</div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-sm font-medium text-muted-foreground flex items-center">
                                <MapPinIcon className="mr-2 h-4 w-4" />
                                Pays
                            </div>
                            <div className="font-medium">{newspaper.country?.name ?? 'N/A'}</div>
                        </div>

                        {newspaper.organization?.metadata &&
                            typeof newspaper.organization.metadata !== "string" &&
                            newspaper.organization.metadata.frequency && (
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-muted-foreground flex items-center">
                                        <CalendarRange className="mr-2 h-4 w-4" />
                                        Fréquence
                                    </div>
                                    <div className="font-medium">
                                        <FrequencyContent
                                            frequency={newspaper.organization.metadata.frequency}
                                        />
                                    </div>
                                </div>
                            )}
                    </div>

                    {newspaper.organization && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <InfoIcon className="h-4 w-4" />
                                    À propos de l'agence
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed max-h-[10ch] overflow-y-auto">
                                    {newspaper.organization.description}
                                </p>
                            </div>
                        </>
                    )}

                    <Separator />

                    <div className="bg-muted/30 p-6 rounded-lg border">
                        <div className="flex items-baseline justify-between mb-4">
                            <span className="text-lg font-medium">Price</span>
                            <span className="text-3xl font-bold text-primary">
                                {priceFormatter(newspaper.price)}
                            </span>
                        </div>

                        <Button
                            size="lg"
                            className={`w-full text-lg ${inCart ? "bg-destructive hover:bg-destructive/90" : ""}`}
                            onClick={handleCartAction}
                        >
                            {inCart ? (
                                <>
                                    <Trash2 className="mr-2 h-5 w-5" />
                                    Retirer du panier
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    Ajouter au panier
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

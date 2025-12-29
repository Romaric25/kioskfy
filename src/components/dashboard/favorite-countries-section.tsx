"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, ArrowUpRight, Settings2, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { NewspaperCard } from "@/components/newspaper-card";
import {
    useFavoriteCountries,
    useNewspapersFromFavoriteCountries
} from "@/hooks/use-favorite-countries.hook";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CountrySelector } from "./country-selector";
import { useState } from "react";

export function FavoriteCountriesSection() {
    const { favoriteCountries, favoriteCountriesLoading } = useFavoriteCountries();
    const { newspapers, newspapersLoading } = useNewspapersFromFavoriteCountries();
    const [selectorOpen, setSelectorOpen] = useState(false);

    // Show only first 4 newspapers
    const displayedNewspapers = newspapers.slice(0, 6);

    if (favoriteCountriesLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-blue-500" />
                            Mes pays favoris
                        </CardTitle>
                        <CardDescription>
                            Journaux des pays que vous suivez
                        </CardDescription>
                    </div>
                    <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5">
                                <Settings2 className="h-4 w-4" />
                                Gérer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Gérer mes pays favoris
                                </DialogTitle>
                                <DialogDescription>
                                    Sélectionnez les pays dont vous souhaitez suivre les journaux
                                </DialogDescription>
                            </DialogHeader>
                            <CountrySelector onClose={() => setSelectorOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {favoriteCountries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Globe className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">Aucun pays sélectionné</h3>
                        <p className="text-muted-foreground text-sm mb-4 max-w-sm">
                            Sélectionnez vos pays préférés pour voir les derniers journaux de ces régions.
                        </p>
                        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    Sélectionner des pays
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Globe className="h-5 w-5" />
                                        Gérer mes pays favoris
                                    </DialogTitle>
                                    <DialogDescription>
                                        Sélectionnez les pays dont vous souhaitez suivre les journaux
                                    </DialogDescription>
                                </DialogHeader>
                                <CountrySelector onClose={() => setSelectorOpen(false)} />
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Favorite countries badges */}
                        <div className="flex flex-wrap gap-2">
                            {favoriteCountries.map((country) => (
                                <Badge
                                    key={country.id}
                                    variant="secondary"
                                    className="gap-1.5 pl-1.5 pr-2.5 py-1"
                                >
                                    <Image
                                        src={country.flag}
                                        alt={country.name}
                                        width={16}
                                        height={16}
                                        className="rounded-full object-cover"
                                    />
                                    {country.name}
                                </Badge>
                            ))}
                        </div>

                        {/* Newspapers from favorite countries */}
                        {newspapersLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : displayedNewspapers.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Aucun journal disponible pour vos pays favoris.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                {displayedNewspapers.map((newspaper: any) => (
                                    <NewspaperCard key={newspaper.id} newspaper={newspaper} />
                                ))}
                            </div>
                        )}

                        {newspapers.length > 4 && (
                            <div className="flex justify-center pt-2">
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/newspapers">
                                        Voir plus de journaux
                                        <ArrowUpRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

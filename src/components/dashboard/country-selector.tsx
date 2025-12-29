"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Check, Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAllCountriesWithFavoriteStatus, useToggleFavoriteCountry } from "@/hooks/use-favorite-countries.hook";
import { cn } from "@/lib/utils";

interface CountrySelectorProps {
    onClose?: () => void;
}

export function CountrySelector({ onClose }: CountrySelectorProps) {
    const { countries, countriesLoading } = useAllCountriesWithFavoriteStatus();
    const toggleFavorite = useToggleFavoriteCountry();

    const handleToggle = (countryId: number) => {
        toggleFavorite.mutate(countryId);
    };

    if (countriesLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const favoriteCount = countries.filter(c => c.isFavorite).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Sélectionnez vos pays</h3>
                    <p className="text-sm text-muted-foreground">
                        {favoriteCount} pays sélectionné{favoriteCount > 1 ? "s" : ""}
                    </p>
                </div>
                {onClose && (
                    <Button variant="outline" onClick={onClose}>
                        Fermer
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {countries.map((country) => (
                    <button
                        key={country.id}
                        onClick={() => handleToggle(country.id)}
                        disabled={toggleFavorite.isPending}
                        className={cn(
                            "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                            "hover:shadow-md hover:scale-[1.02]",
                            country.isFavorite
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/50"
                        )}
                    >
                        {country.isFavorite && (
                            <div className="absolute top-2 right-2">
                                <Check className="h-4 w-4 text-primary" />
                            </div>
                        )}
                        <Image
                            src={country.flag}
                            alt={country.name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-center line-clamp-1">
                            {country.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

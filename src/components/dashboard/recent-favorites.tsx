"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { NewspaperCard } from "@/components/newspaper-card";

interface FavoriteItem {
    id: number;
    newspaper: any;
}

interface RecentFavoritesProps {
    favorites: FavoriteItem[];
    isLoading: boolean;
    totalCount: number;
}

export function RecentFavorites({ favorites, isLoading, totalCount }: RecentFavoritesProps) {
    return (
        <div className="grid gap-4">
            <Card className="col-span-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle>Favoris récents</CardTitle>
                            <CardDescription>
                                Les derniers journaux que vous avez ajoutés à vos favoris
                            </CardDescription>
                        </div>
                        {totalCount > 0 && (
                            <Button asChild variant="outline" size="sm">
                                <Link href="/dashboard/favoris">
                                    Voir tout
                                    <ArrowUpRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : favorites.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="rounded-full bg-muted p-4 mb-4">
                                <Heart className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg mb-1">Aucun favori</h3>
                            <p className="text-muted-foreground text-sm mb-4 max-w-sm">
                                Vous n'avez pas encore ajouté de journaux à vos favoris.
                            </p>
                            <Button asChild>
                                <Link href="/newspapers">Découvrir les journaux</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {favorites.map((fav) => (
                                <NewspaperCard key={fav.id} newspaper={fav.newspaper} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

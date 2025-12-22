"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Settings } from "lucide-react";

export function IncompleteOrganizationCard() {
    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                    Agence incomplète
                </CardTitle>
                <CardDescription>Veuillez compléter les informations de votre organisation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        Vous devez renseigner toutes les informations requises de votre organisation avant de pouvoir publier une édition.
                    </p>
                </div>
                <Button asChild className="w-full">
                    <a href="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Accéder aux paramètres
                    </a>
                </Button>
            </CardContent>
        </Card>
    );
}

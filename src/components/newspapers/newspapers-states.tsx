import { Newspaper, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-full p-6 border border-primary/20">
                    <Newspaper className="h-12 w-12 text-primary" />
                </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
                Aucun journal disponible
            </h3>
            <p className="text-muted-foreground max-w-md">
                Il n&apos;y a pas encore de journaux publiés. Revenez plus tard pour découvrir les dernières éditions.
            </p>
        </div>
    );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-destructive/20 blur-2xl rounded-full" />
                <div className="relative bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-full p-6 border border-destructive/20">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
                Erreur de chargement
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
                Impossible de charger les journaux. Veuillez vérifier votre connexion et réessayer.
            </p>
            <Button onClick={onRetry} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Réessayer
            </Button>
        </div>
    );
}

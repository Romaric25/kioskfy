"use client";

interface DashboardWelcomeProps {
    userName?: string;
}

export function DashboardWelcome({ userName }: DashboardWelcomeProps) {
    return (
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">
                Bonjour, {userName?.split(" ")[0] || "Utilisateur"} !
            </h1>
            <p className="text-muted-foreground">
                Voici un aperçu de votre activité sur Kioskfy.
            </p>
        </div>
    );
}

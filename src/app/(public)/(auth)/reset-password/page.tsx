import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Réinitialisation du mot de passe | kioskfy",
    description: "Choisissez un nouveau mot de passe",
};

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left side - Form */}
            <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 w-fit"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à l&apos;accueil
                </Link>

                <div className="mx-auto w-full max-w-md">
                    <Suspense fallback={<div>Chargement...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>

            {/* Right side - Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-lg space-y-6 text-center">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Sécurisez votre compte
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Choisissez un mot de passe fort pour protéger vos données personnelles et vos abonnements.
                    </p>
                </div>
            </div>
        </div>
    );
}

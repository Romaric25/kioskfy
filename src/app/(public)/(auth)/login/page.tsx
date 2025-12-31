import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Connexion | kioskfy",
    description: "Connexion - kioskfy",
    robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function LoginPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left side - Login Form */}
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
                        <LoginForm />
                    </Suspense>
                </div>
            </div>

            {/* Right side - Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-lg space-y-6 text-center">
                    <h2 className="text-4xl font-bold tracking-tight">
                        Bienvenue sur <span className="text-primary">kioskfy.com</span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Accédez à tous vos journaux et magazines africains préférés en un
                        seul endroit. Restez informé avec les dernières actualités du
                        continent.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-8">
                        <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border">
                            <div className="text-3xl font-bold text-primary mb-2">500+</div>
                            <div className="text-sm text-muted-foreground">
                                Journaux disponibles
                            </div>
                        </div>
                        <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border">
                            <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                            <div className="text-sm text-muted-foreground">
                                Lecteurs actifs
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

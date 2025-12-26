import { Metadata } from "next";
import { AllNewspapersPublished } from "@/components/newspapers/all-newspapers-published";
import { Newspaper } from "lucide-react";
import Link from "next/link";
import { CategoriesSection } from "@/components/categories-section";

export const metadata: Metadata = {
    title: "Journaux | Kioskfy - Kiosque Numérique Africain",
    description: "Découvrez tous les journaux africains disponibles sur Kioskfy. Accédez aux dernières éditions de vos publications préférées.",
    openGraph: {
        title: "Journaux | Kioskfy",
        description: "Découvrez tous les journaux africains disponibles sur Kioskfy.",
    },
};

export default function NewspapersPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-border/40">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />

                {/* Gradient Orbs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-y-1/2" />

                <div className="relative container mx-auto px-4 py-4 md:py-6">
                    <CategoriesSection />
                </div>
            </section>

            {/* Newspapers Grid Section */}
            <section className="container mx-auto px-4 py-12 md:py-4">
                <AllNewspapersPublished/>
            </section>

            {/* CTA Section */}
            <section className="border-t border-border/40 bg-muted/30">
                <div className="container mx-auto px-4 py-16 md:py-20">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                            Vous êtes éditeur de presse ?
                        </h2>
                        <p className="text-muted-foreground">
                            Rejoignez notre plateforme et distribuez vos publications
                            à des milliers de lecteurs à travers l&apos;Afrique.
                        </p>
                        <Link
                            href="/partnership"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                        >
                            Devenir partenaire
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
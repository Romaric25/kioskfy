
import { AllNewspapersPublished } from "@/components/newspapers/all-newspapers-published";
import Link from "next/link";
import { SiteBreadcrumb } from "@/components/site-breadcrumb";
import { CategoriesSection } from "@/components/categories-section";
import { Header } from "@/components/menus/header";
import { Footer } from "@/components/footer";
import { CountriesController } from "@/server/controllers/countries.controller";
import { OrganizationsController } from "@/server/controllers/organizations.controller";
import { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
    const [{ data: countries = [] }, { data: organizations = [] }] = await Promise.all([
        CountriesController.getAll(),
        OrganizationsController.listAll(),
    ]);

    const countryNames = countries.map((c) => c.name).join(", ");
    const orgNames = organizations.map((o) => o.name).join(", ");

    const description = `Accédez à tous les journaux quotidiens et hebdomadaires d'Afrique sur kioskfy. Lisez la presse de nos pays partenaires : ${countryNames}. Retrouvez les publications de : ${orgNames} et bien plus en illimité.`;

    return {
        title: "Journaux | kioskfy - Votre kiosque numérique de presse africaine",
        description,
        keywords: [
            "journaux",
            "presse quotidienne",
            "actualités",
            "kiosque numérique",
            "presse afrique",
            ...countries.map((c) => `presse ${c.name.toLowerCase()}`),
            ...countries.map((c) => `journaux ${c.name.toLowerCase()}`),
            ...organizations.map((o) => o.name.toLowerCase()),
            ...organizations.map((o) => `journaux ${o.name.toLowerCase()}`),
        ],
        alternates: {
            canonical: "/newspapers",
        },
        openGraph: {
            title: "Journaux | kioskfy - Toute la presse africaine",
            description,
            url: "/newspapers",
            siteName: "kioskfy",
            images: [
                {
                    url: "/og-image.jpg",
                    width: 1200,
                    height: 630,
                    alt: "Journaux sur kioskfy",
                },
            ],
            locale: "fr_FR",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: "Journaux | kioskfy - Votre kiosque numérique",
            description,
            images: ["/og-image.jpg"],
        },
    };
}

export default function NewspapersPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
                <div className="container mx-auto px-4 pt-4">
                    <SiteBreadcrumb />
                </div>
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
                    <Suspense fallback={<div>Chargement...</div>}>
                        <AllNewspapersPublished />
                    </Suspense>
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
            <Footer />
        </>
    );
}
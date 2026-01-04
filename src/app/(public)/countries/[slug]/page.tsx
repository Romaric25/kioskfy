import type { Metadata } from "next";
import { Suspense } from "react";
import { CountriesController } from "@/server/controllers/countries.controller";
import { CountryPage } from "@/components/countries/country-page";
import { NewspaperCardSkeleton } from "@/components/skeletons/newspaper-card-skeleton";

interface CountryPageProps {
    params: Promise<{ slug: string }>;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
    const { slug } = await params;
    const result = await CountriesController.getBySlug(slug);
    const country = result.success && result.data ? result.data : null;
    const countryName = country?.name || slug;

    const description = `Découvrez tous les journaux et magazines du ${countryName} sur kioskfy. Accédez à la presse locale et internationale en illimité.`;

    return {
        title: `Presse ${countryName} | kioskfy - Journaux et Magazines`,
        description,
        openGraph: {
            type: "website",
            locale: "fr_FR",
            url: `${baseUrl}/countries/${slug}`,
            title: `Presse ${countryName} | kioskfy`,
            description,
            siteName: "kioskfy",
            images: [
                {
                    url: country?.flag || "/og-image.jpg", // Use flag as OG image if available? Maybe not ideal size. stick to default or specific og.
                    width: 1200,
                    height: 630,
                    alt: `Presse ${countryName} sur kioskfy`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `Presse ${countryName} | kioskfy`,
            description,
            images: ["/og-image.jpg"],
        },
        alternates: {
            canonical: `${baseUrl}/countries/${slug}`,
        },
    };
}

function CountryPageSkeleton() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-96 bg-muted animate-pulse rounded" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                    <NewspaperCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

export default async function Page({ params }: CountryPageProps) {
    const { slug } = await params;
    return (
        <Suspense fallback={<CountryPageSkeleton />}>
            <CountryPage slug={slug} />
        </Suspense>
    );
}

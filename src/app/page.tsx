import { Footer } from '@/components/footer';
import { Header } from '@/components/menus/header';
import { Hero } from '@/components/hero';
import { Section } from '@/components/ui/section';
import { CountryCarousel } from '@/components/country-carousel';
import { FeaturedNewspapers } from '@/components/featured-newspapers';
import { RecentMagazines } from '@/components/recent-magazines';
import { CategoriesSection } from '@/components/categories-section';
import { AgenciesCarrousel } from '@/components/agencies-carrousel';
import { Metadata } from 'next';
import { CountriesController } from '@/server/controllers/countries.controller';
import { OrganizationsController } from '@/server/controllers/organizations.controller';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kioskfy.com";

export async function generateMetadata(): Promise<Metadata> {
    const [{ data: countries = [] }, { data: organizations = [] }] = await Promise.all([
        CountriesController.getAll(),
        OrganizationsController.listAll(),
    ]);

    const countryNames = countries.map((c) => c.name).join(", ");
    const orgNames = organizations.map((o) => o.name).join(", ");

    const description = `Lisez vos journaux et magazines africains préférés en illimité. Accédez à toute la presse de : ${countryNames}. Retrouvez les publications de : ${orgNames} et plus encore sur kioskfy.`;

    return {
        title: "kioskfy - Votre kiosque numérique de presse africaine",
        description,
        keywords: [
            "presse africaine",
            "journaux cameroun",
            "journaux côte d'ivoire",
            "actualités afrique",
            "kiosque numérique",
            "lecture en ligne",
            "abonnement presse",
            "kioskfy",
            ...countries.map((c) => `presse ${c.name.toLowerCase()}`),
            ...countries.map((c) => `journaux ${c.name.toLowerCase()}`),
            ...organizations.map((o) => o.name.toLowerCase()),
        ],
        authors: [{ name: "kioskfy" }],
        creator: "kioskfy",
        publisher: "kioskfy",
        alternates: {
            canonical: baseUrl,
        },
        openGraph: {
            type: "website",
            locale: "fr_FR",
            url: baseUrl,
            title: "kioskfy - Votre kiosque numérique de presse africaine",
            description,
            siteName: "kioskfy",
            images: [
                {
                    url: `${baseUrl}/og-image.jpg`,
                    width: 1200,
                    height: 630,
                    alt: "kioskfy - Presse Africaine",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: "kioskfy - Votre kiosque numérique de presse africaine",
            description,
            images: [`${baseUrl}/og-image.jpg`],
            creator: "@kioskfy",
        },
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
}

export default function RootPage() {
    return (
        <>
            <Header />
            <Hero />

            <CategoriesSection />

            <CountryCarousel />
            <FeaturedNewspapers />
            <RecentMagazines />
            <AgenciesCarrousel />
            <Footer />
        </>
    )
}

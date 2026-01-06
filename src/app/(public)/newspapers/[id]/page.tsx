import { Header } from "@/components/menus/header";
import { SingleNewspaper } from "@/components/newspapers/single-newspaper";
import { NewspapersController } from "@/server/controllers/newspapers.controller";
import { Metadata } from "next";
import {
    JsonLd,
    generateProductSchema,
    generateNewsArticleSchema,
    generateBreadcrumbSchema,
} from "@/components/seo/json-ld";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kioskfy.com";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const params = await props.params;
    const { id } = params;
    const response = await NewspapersController.getById(id);

    if (!response.success || !response.data) {
        return {
            title: "Publication introuvable | kioskfy",
            description: "Cette publication n'existe pas ou a été supprimée.",
        };
    }

    const item = response.data;
    const orgName = item.organization?.name || "Éditeur inconnu";
    const countryName = item.country?.name || "";
    const publishDate = new Date(item.publishDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const title = `${orgName} - ${item.issueNumber}`;
    const description = `Lisez le numéro ${item.issueNumber} du ${orgName} (${countryName}) paru le ${publishDate}. Disponible en lecture numérique immédiate sur kioskfy.`;

    // Facebook requires absolute URLs for og:image
    const getAbsoluteUrl = (url: string) => {
        if (!url) return `${baseUrl}/og-image.jpg`;
        if (url.startsWith('http')) return url;
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };
    const ogImage = getAbsoluteUrl(item.coverImage);

    return {
        title,
        description,
        keywords: [
            orgName,
            item.issueNumber,
            countryName,
            "presse africaine",
            "kiosque numérique",
            "magazine",
            "journal",
        ],
        alternates: {
            canonical: `${baseUrl}/newspapers/${id}`,
        },
        openGraph: {
            title,
            description,
            siteName: "kioskfy",
            url: `${baseUrl}/newspapers/${id}`,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                }
            ],
            type: "article",
            publishedTime: item.publishDate.toISOString(),
            section: "Presse",
            locale: "fr_FR",

        },
        twitter: {
            card: "summary_large_image",
            title,
            creator: "@kioskfy",
            description,
            images: [ogImage],
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

interface NewspaperPageProps {
    params: Promise<{ id: string }>;
}

export default async function NewspapersPage({ params }: NewspaperPageProps) {
    const { id } = await params;
    const response = await NewspapersController.getById(id);

    // Generate JSON-LD schemas only if newspaper data is available
    const newspaper = response.success ? response.data : null;

    const productSchema = newspaper
        ? generateProductSchema({
            name: `${newspaper.organization?.name || "Journal"} - N°${newspaper.issueNumber}`,
            description: `Numéro ${newspaper.issueNumber} du ${newspaper.organization?.name || "journal"} paru le ${new Date(newspaper.publishDate).toLocaleDateString("fr-FR")}`,
            image: newspaper.coverImage || `${baseUrl}/og-image.jpg`,
            brand: newspaper.organization?.name || "kioskfy",
            price: newspaper.price,
            currency: "XOF",
            availability: "InStock",
            url: `${baseUrl}/newspapers/${id}`,
        })
        : null;

    const articleSchema = newspaper
        ? generateNewsArticleSchema({
            headline: `${newspaper.organization?.name || "Journal"} - N°${newspaper.issueNumber}`,
            description: `Édition numérique du ${newspaper.organization?.name || "journal"}`,
            image: newspaper.coverImage || `${baseUrl}/og-image.jpg`,
            datePublished: new Date(newspaper.publishDate).toISOString(),
            dateModified: newspaper.updatedAt ? new Date(newspaper.updatedAt).toISOString() : undefined,
            author: {
                name: newspaper.organization?.name || "kioskfy",
                url: `${baseUrl}/organization/${newspaper.organization?.slug || ""}`,
            },
            publisher: {
                name: "kioskfy",
                logo: `${baseUrl}/logo.png`,
            },
            url: `${baseUrl}/newspapers/${id}`,
        })
        : null;

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Accueil", url: "/" },
        { name: "Journaux", url: "/newspapers" },
        { name: newspaper?.issueNumber || "Publication", url: `/newspapers/${id}` },
    ]);

    return (
        <>
            {/* JSON-LD Schemas */}
            <JsonLd data={breadcrumbSchema} />
            {productSchema && <JsonLd data={productSchema} />}
            {articleSchema && <JsonLd data={articleSchema} />}

            <Header />
            <SingleNewspaper />
        </>
    );
}
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

    const title = `${orgName} - N°${item.issueNumber}`;
    const description = `Lisez le numéro ${item.issueNumber} du ${orgName} (${countryName}) paru le ${publishDate}. Disponible en lecture numérique immédiate sur kioskfy.`;

    const images = item.coverImage ? [item.coverImage] : ["/og-image.jpg"];

    return {
        title,
        description,
        keywords: [
            orgName,
            `N°${item.issueNumber}`,
            countryName,
            "presse africaine",
            "kiosque numérique",
            "magazine",
            "journal",
        ],
        alternates: {
            canonical: `${baseUrl}/magazines/${id}`,
        },
        openGraph: {
            title,
            description,
            siteName: "kioskfy",
            url: `${baseUrl}/magazines/${id}`,
            images,
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
            images,
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

interface MagazinePageProps {
    params: Promise<{ id: string }>;
}

export default async function MagazinesPage({ params }: MagazinePageProps) {
    const { id } = await params;
    const response = await NewspapersController.getById(id);

    // Generate JSON-LD schemas only if magazine data is available
    const magazine = response.success ? response.data : null;

    const productSchema = magazine
        ? generateProductSchema({
            name: `${magazine.organization?.name || "Magazine"} - N°${magazine.issueNumber}`,
            description: `Numéro ${magazine.issueNumber} du ${magazine.organization?.name || "magazine"} paru le ${new Date(magazine.publishDate).toLocaleDateString("fr-FR")}`,
            image: magazine.coverImage || `${baseUrl}/og-image.jpg`,
            brand: magazine.organization?.name || "kioskfy",
            price: magazine.price,
            currency: "XOF",
            availability: "InStock",
            url: `${baseUrl}/magazines/${id}`,
        })
        : null;

    const articleSchema = magazine
        ? generateNewsArticleSchema({
            headline: `${magazine.organization?.name || "Magazine"} - N°${magazine.issueNumber}`,
            description: `Édition numérique du ${magazine.organization?.name || "magazine"}`,
            image: magazine.coverImage || `${baseUrl}/og-image.jpg`,
            datePublished: new Date(magazine.publishDate).toISOString(),
            dateModified: magazine.updatedAt ? new Date(magazine.updatedAt).toISOString() : undefined,
            author: {
                name: magazine.organization?.name || "kioskfy",
                url: `${baseUrl}/organization/${magazine.organization?.slug || ""}`,
            },
            publisher: {
                name: "kioskfy",
                logo: `${baseUrl}/logo.png`,
            },
            url: `${baseUrl}/magazines/${id}`,
        })
        : null;

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Accueil", url: "/" },
        { name: "Magazines", url: "/magazines" },
        { name: magazine?.issueNumber || "Publication", url: `/magazines/${id}` },
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
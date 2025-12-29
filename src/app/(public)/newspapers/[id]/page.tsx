import { Header } from "@/components/menus/header";
import { SingleNewspaper } from "@/components/newspapers/single-newspaper";
import { NewspapersController } from "@/server/controllers/newspapers.controller";
import { Metadata } from "next";


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
        openGraph: {
            title,
            description,
            images,
            type: "article",
            publishedTime: item.publishDate.toISOString(),
            section: "Presse",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images,
        },
    };
}

export default function NewspapersPage() {
    return (
        <>
            <Header />
            <SingleNewspaper />
        </>
    );
}
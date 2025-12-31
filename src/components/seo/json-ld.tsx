interface JsonLdProps {
    data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

// Types pour les schémas
interface OrganizationSchema {
    name: string;
    url: string;
    logo?: string;
    description?: string;
    sameAs?: string[];
}

interface ProductSchema {
    name: string;
    description: string;
    image: string;
    brand: string;
    price: string | number;
    currency?: string;
    availability?: "InStock" | "OutOfStock" | "PreOrder";
    url: string;
}

interface ArticleSchema {
    headline: string;
    description: string;
    image: string;
    datePublished: string;
    dateModified?: string;
    author: { name: string; url?: string };
    publisher: { name: string; logo?: string };
    url: string;
}

interface BreadcrumbItem {
    name: string;
    url: string;
}

interface WebsiteSchema {
    name: string;
    url: string;
    description?: string;
    potentialAction?: {
        type: "SearchAction";
        target: string;
        queryInput: string;
    };
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kioskfy.com";

// Schema pour le site web
export function generateWebsiteSchema(): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "kioskfy",
        url: baseUrl,
        description: "Votre kiosque numérique de presse africaine. Accédez instantanément aux journaux et magazines d'Afrique.",
        publisher: {
            "@type": "Organization",
            name: "kioskfy",
            logo: {
                "@type": "ImageObject",
                url: `${baseUrl}/logo.png`,
            },
        },
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${baseUrl}/newspapers?search={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    };
}

// Schema pour l'organisation
export function generateOrganizationSchema(organization?: OrganizationSchema): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: organization?.name || "kioskfy",
        url: organization?.url || baseUrl,
        logo: organization?.logo || `${baseUrl}/logo.png`,
        description: organization?.description || "Votre kiosque numérique de presse africaine",
        sameAs: organization?.sameAs || [
            "https://twitter.com/kioskfy",
            "https://facebook.com/kioskfy",
            "https://instagram.com/kioskfy",
        ],
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            email: "contact@kioskfy.com",
            availableLanguage: ["French"],
        },
    };
}

// Schema pour un produit (journal/magazine)
export function generateProductSchema(product: ProductSchema): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.image,
        brand: {
            "@type": "Brand",
            name: product.brand,
        },
        offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: product.currency || "XOF",
            availability: `https://schema.org/${product.availability || "InStock"}`,
            url: product.url,
            seller: {
                "@type": "Organization",
                name: "kioskfy",
            },
        },
        category: "Publication",
        isAccessibleForFree: false,
    };
}

// Schema pour un article de presse
export function generateNewsArticleSchema(article: ArticleSchema): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: article.headline,
        description: article.description,
        image: article.image,
        datePublished: article.datePublished,
        dateModified: article.dateModified || article.datePublished,
        author: {
            "@type": "Organization",
            name: article.author.name,
            url: article.author.url,
        },
        publisher: {
            "@type": "Organization",
            name: article.publisher.name,
            logo: {
                "@type": "ImageObject",
                url: article.publisher.logo || `${baseUrl}/logo.png`,
            },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": article.url,
        },
        isAccessibleForFree: false,
    };
}

// Schema pour les breadcrumbs
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
        })),
    };
}

// Schema pour une liste de produits (page catalogue)
export function generateItemListSchema(
    items: Array<{ name: string; url: string; image?: string; position?: number }>,
    listName: string
): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: listName,
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: item.position || index + 1,
            item: {
                "@type": "Product",
                name: item.name,
                url: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
                image: item.image,
            },
        })),
    };
}

// Schema pour une page FAQ
export function generateFAQSchema(
    faqs: Array<{ question: string; answer: string }>
): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };
}

// Schema pour le magasin local/online
export function generateLocalBusinessSchema(): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "OnlineBusiness",
        "@id": baseUrl,
        name: "kioskfy",
        description: "Kiosque numérique de presse africaine",
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        image: `${baseUrl}/og-image.jpg`,
        priceRange: "$$",
        telephone: "+225XXXXXXXXX",
        email: "contact@kioskfy.com",
        address: {
            "@type": "PostalAddress",
            addressCountry: "CI",
        },
        sameAs: [
            "https://twitter.com/kioskfy",
            "https://facebook.com/kioskfy",
        ],
    };
}

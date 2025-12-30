import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoriesController } from "@/server/controllers/categories.controller";
import { CategoryPage } from "@/components/categories/category-page";
import { NewspaperCardSkeleton } from "@/components/skeletons/newspaper-card-skeleton";

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    const result = await CategoriesController.getBySlug(slug);
    const category = result.success && result.data ? result.data : null;
    const categoryName = category?.name || slug;

    const description = `Découvrez tous les journaux et magazines de la catégorie ${categoryName} sur kioskfy. Accédez à la presse africaine en illimité.`;

    return {
        title: `${categoryName} | kioskfy - Presse Africaine`,
        description,
        openGraph: {
            type: "website",
            locale: "fr_FR",
            url: `/categories/${slug}`,
            title: `${categoryName} | kioskfy`,
            description,
            siteName: "kioskfy",
            images: [
                {
                    url: "/og-image.jpg",
                    width: 1200,
                    height: 630,
                    alt: `${categoryName} sur kioskfy`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${categoryName} | kioskfy`,
            description,
            images: ["/og-image.jpg"],
        },
        alternates: {
            canonical: `/categories/${slug}`,
        },
    };
}

function CategoryPageSkeleton() {
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

export default async function Page({ params }: CategoryPageProps) {
    const { slug } = await params;
    return (
        <Suspense fallback={<CategoryPageSkeleton />}>
            <CategoryPage slug={slug} />
        </Suspense>
    );
}
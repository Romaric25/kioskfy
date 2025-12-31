import type { MetadataRoute } from 'next'
import { db } from "@/lib/db";
import { newspapers, categories } from "@/db/app-schema";
import { organizations } from "@/db/auth-schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { Status } from "@/server/models/newspaper.model";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Fetch published newspapers (Journals)
    const publishedNewspapers = await db
        .select({
            id: newspapers.id,
            updatedAt: newspapers.updatedAt,
        })
        .from(newspapers)
        .leftJoin(organizations, eq(newspapers.organizationId, organizations.id))
        .where(
            and(
                eq(newspapers.status, Status.PUBLISHED),
                sql`JSON_EXTRACT(${organizations.metadata}, '$.isActive') = true`,
                sql`JSON_UNQUOTE(JSON_EXTRACT(${organizations.metadata}, '$.type')) = 'Journal'`
            )
        )
        .orderBy(desc(newspapers.updatedAt));

    // Fetch published magazines
    const publishedMagazines = await db
        .select({
            id: newspapers.id,
            updatedAt: newspapers.updatedAt,
        })
        .from(newspapers)
        .leftJoin(organizations, eq(newspapers.organizationId, organizations.id))
        .where(
            and(
                eq(newspapers.status, Status.PUBLISHED),
                sql`JSON_EXTRACT(${organizations.metadata}, '$.isActive') = true`,
                sql`JSON_UNQUOTE(JSON_EXTRACT(${organizations.metadata}, '$.type')) = 'Magazine'`
            )
        )
        .orderBy(desc(newspapers.updatedAt));

    // Fetch all categories
    const allCategories = await db
        .select({
            slug: categories.slug,
            updatedAt: categories.updatedAt,
        })
        .from(categories)
        .orderBy(desc(categories.updatedAt));

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 1,
            images: [`${baseUrl}/og-image.jpg`],
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/newspapers`,
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/magazines`,
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/partnership`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/categories`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ];

    // Dynamic newspaper pages
    const newspaperPages: MetadataRoute.Sitemap = publishedNewspapers.map((newspaper) => ({
        url: `${baseUrl}/newspapers/${newspaper.id}`,
        lastModified: newspaper.updatedAt ? new Date(newspaper.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Dynamic magazine pages
    const magazinePages: MetadataRoute.Sitemap = publishedMagazines.map((magazine) => ({
        url: `${baseUrl}/magazines/${magazine.id}`,
        lastModified: magazine.updatedAt ? new Date(magazine.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Dynamic category pages
    const categoryPages: MetadataRoute.Sitemap = allCategories.map((category) => ({
        url: `${baseUrl}/categories/${category.slug}`,
        lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...staticPages, ...newspaperPages, ...magazinePages, ...categoryPages];
}
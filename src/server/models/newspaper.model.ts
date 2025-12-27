import { z } from "zod";
import { organizationSchema } from "./organization.model";
import { categorySchema } from "./category.model";
import { countrySchema } from "./country.model";

export enum Status {
    PUBLISHED = 'published',
    DRAFT = 'draft',
    PENDING = 'pending',
    ARCHIVED = 'archived',
}
export const newspaperSchema = z.object({
    id: z.string(),
    issueNumber: z.string().min(1, "Le numéro d'édition est requis"),
    publishDate: z.date().min(new Date(), "La date de publication est invalide"),
    coverImage: z.string().url("L'URL de la couverture est invalide"),
    price: z.union([z.string(), z.number()]),
    pdf: z.url("L'URL du PDF est invalide"),
    status: z.enum(Status),
    categories: z.array(categorySchema),
    organization: organizationSchema,
    country: countrySchema,
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Newspaper = z.infer<typeof newspaperSchema>;

// API Response type - matches what the controller actually returns
// This is different from the Newspaper type because:
// 1. status is a string literal from DB, not the enum
// 2. categories don't include createdAt/updatedAt
// 3. organization and country may be null
export interface NewspaperResponse {
    id: string;
    issueNumber: string;
    publishDate: Date;
    coverImage: string;
    price: string | number;
    pdf: string;
    status: "published" | "draft" | "pending" | "archived";
    createdAt: Date;
    updatedAt?: Date;
    categories?: {
        id: number;
        name: string;
        slug: string;
        icon: string;
        color?: string | null;
        createdAt?: Date;
        updatedAt?: Date;
    }[];
    organization?: {
        id: string;
        name: string;
        slug: string;
        logo: string | null;
        metadata?: string | { frequency?: string } | null;
    } | null;
    country?: {
        id: number;
        name: string;
        slug: string;
        flag: string;
        code: string;
        currency?: string;
    } | null;
    pdfUpload?: {
        id: number;
        filename: string;
        thumbnailUrl: string;
    } | null;
}

// Simplified type for list views (organization/country listings)
export interface NewspaperListItem {
    id: string;
    issueNumber: string;
    publishDate: Date;
    coverImage: string;
    price: string | number;
    pdf: string;
    status: "published" | "draft" | "pending" | "archived";
    createdAt: Date;
    organization?: {
        id: string;
        name: string;
        logo: string | null;
    } | null;
}

export const createNewspaperSchema = z.object({
    issueNumber: z.string().min(1, "Le numéro d'édition est requis"),
    publishDate: z.string().min(1, "La date de publication est requise"),
    coverImageFile: z.array(z.any()).optional(),
    coverImageUploadId: z.number().optional(),
    price: z.number().positive("Le prix doit être positif"),
    status: z.enum([Status.DRAFT, Status.PENDING, Status.PUBLISHED, Status.ARCHIVED]),
    pdfFile: z.array(z.any()).optional(),
    pdfUploadId: z.number().optional(),
    categoryIds: z.array(z.number()),
    organizationId: z.string(),
    country: z.string(),
});

export type CreateNewspaper = z.infer<typeof createNewspaperSchema>;

export const updateNewspaperSchema = createNewspaperSchema.partial().extend({
    status: z.enum([Status.PUBLISHED, Status.DRAFT, Status.ARCHIVED, Status.PENDING]).optional(),
    autoPublish: z.boolean().optional(),
});

export type UpdateNewspaper = z.infer<typeof updateNewspaperSchema>;

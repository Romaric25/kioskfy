import { z } from "zod/v4";

/**
 * Upload schema for validation
 */
export const uploadSchema = z.object({
    id: z.number().optional(),
    filename: z.string().min(1, "Le nom du fichier est requis"),
    thumbnailS3Key: z.string().min(1, "La clé S3 est requise"),
    thumbnailUrl: z.url("L'URL doit être valide"),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

/**
 * Schema for creating a new upload
 */
export const createUploadSchema = uploadSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

/**
 * Schema for updating an upload
 */
export const updateUploadSchema = createUploadSchema.partial();

/**
 * TypeScript types inferred from schemas
 */
export type Upload = z.infer<typeof uploadSchema>;
export type CreateUpload = z.infer<typeof createUploadSchema>;
export type UpdateUpload = z.infer<typeof updateUploadSchema>;

import { z } from "zod";

export const categorySchema = z.object({
    id: z.number(),
    name: z.string().min(1, "Le nom est requis"),
    slug: z.string().min(1, "Le slug est requis"),
    icon: z.string().min(1, "L'icône est requise"),
    color: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Category = z.infer<typeof categorySchema>;

export const createCategorySchema = categorySchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export type CreateCategory = z.infer<typeof createCategorySchema>;

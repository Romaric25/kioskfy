import { db } from "@/lib/db";
import { categories } from "@/db/app-schema";
import { eq, desc } from "drizzle-orm";
import {
    createCategorySchema,
    type CreateCategory,
} from "@/server/models/category.model";

export class CategoriesController {
    // Get all categories
    static async getAll() {
        const allCategories = await db
            .select({
                id: categories.id,
                name: categories.name,
                slug: categories.slug,
                icon: categories.icon,
                color: categories.color,
                createdAt: categories.createdAt,
                updatedAt: categories.updatedAt,
            })
            .from(categories)
            .orderBy(desc(categories.createdAt));

        return {
            success: true,
            data: allCategories,
        };
    }

    // Get category by ID
    static async getById(id: number) {
        const category = await db
            .select({
                id: categories.id,
                name: categories.name,
                slug: categories.slug,
                icon: categories.icon,
                color: categories.color,
                createdAt: categories.createdAt,
                updatedAt: categories.updatedAt,
            })
            .from(categories)
            .where(eq(categories.id, id))
            .limit(1);

        if (category.length === 0) {
            return {
                success: false,
                status: 404,
                error: "Catégorie non trouvée",
            };
        }

        return {
            success: true,
            data: category[0],
        };
    }

    // Get category by slug
    static async getBySlug(slug: string) {
        const category = await db
            .select({
                id: categories.id,
                name: categories.name,
                slug: categories.slug,
                icon: categories.icon,
                color: categories.color,
                createdAt: categories.createdAt,
                updatedAt: categories.updatedAt,
            })
            .from(categories)
            .where(eq(categories.slug, slug))
            .limit(1);

        if (category.length === 0) {
            return {
                success: false,
                status: 404,
                error: "Catégorie non trouvée",
            };
        }

        return {
            success: true,
            data: category[0],
        };
    }

    // Create a new category
    static async create(body: unknown) {
        const validation = createCategorySchema.safeParse(body);
        if (!validation.success) {
            return {
                success: false,
                status: 400,
                error: "Données invalides",
                details: validation.error.flatten().fieldErrors,
            };
        }

        const data: CreateCategory = validation.data;

        try {
            // Check if slug already exists
            const existingCategory = await db
                .select({ id: categories.id })
                .from(categories)
                .where(eq(categories.slug, data.slug))
                .limit(1);

            if (existingCategory.length > 0) {
                return {
                    success: false,
                    status: 409,
                    error: "Une catégorie avec ce slug existe déjà",
                };
            }

            const result = await db.insert(categories).values({
                name: data.name,
                slug: data.slug,
                icon: data.icon,
                color: data.color,
            });

            return {
                success: true,
                status: 201,
                data: { id: result[0].insertId },
                message: "Catégorie créée avec succès",
            };
        } catch (error) {
            return {
                success: false,
                status: 400,
                error: "Erreur lors de la création de la catégorie",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            };
        }
    }

    // Update a category
    static async update(id: number, body: unknown) {
        const validation = createCategorySchema.partial().safeParse(body);
        if (!validation.success) {
            return {
                success: false,
                status: 400,
                error: "Données invalides",
                details: validation.error.flatten().fieldErrors,
            };
        }

        const data = validation.data;

        try {
            const existingCategory = await db
                .select()
                .from(categories)
                .where(eq(categories.id, id))
                .limit(1);

            if (existingCategory.length === 0) {
                return {
                    success: false,
                    status: 404,
                    error: "Catégorie non trouvée",
                };
            }

            // Check if new slug already exists (if slug is being updated)
            if (data.slug && data.slug !== existingCategory[0].slug) {
                const slugExists = await db
                    .select({ id: categories.id })
                    .from(categories)
                    .where(eq(categories.slug, data.slug))
                    .limit(1);

                if (slugExists.length > 0) {
                    return {
                        success: false,
                        status: 409,
                        error: "Une catégorie avec ce slug existe déjà",
                    };
                }
            }

            const updateData: Record<string, unknown> = {};
            if (data.name) updateData.name = data.name;
            if (data.slug) updateData.slug = data.slug;
            if (data.icon) updateData.icon = data.icon;
            if (data.color !== undefined) updateData.color = data.color;

            if (Object.keys(updateData).length > 0) {
                await db.update(categories).set(updateData).where(eq(categories.id, id));
            }

            return {
                success: true,
                message: "Catégorie mise à jour avec succès",
            };
        } catch (error) {
            return {
                success: false,
                status: 400,
                error: "Erreur lors de la mise à jour de la catégorie",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            };
        }
    }

    // Delete a category
    static async delete(id: number) {
        try {
            const existingCategory = await db
                .select()
                .from(categories)
                .where(eq(categories.id, id))
                .limit(1);

            if (existingCategory.length === 0) {
                return {
                    success: false,
                    status: 404,
                    error: "Catégorie non trouvée",
                };
            }

            await db.delete(categories).where(eq(categories.id, id));

            return {
                success: true,
                message: "Catégorie supprimée avec succès",
            };
        } catch (error) {
            return {
                success: false,
                status: 400,
                error: "Erreur lors de la suppression de la catégorie",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            };
        }
    }
}

import { Elysia, t } from "elysia";
import { CategoriesController } from "@/server/controllers/categories.controller";

export const categoriesService = new Elysia({ prefix: "/categories" })
    // Get all categories
    .get(
        "/",
        async () => {
            return await CategoriesController.getAll();
        },
        {
            detail: {
                tags: ["Public"],
                summary: "Récupérer toutes les catégories",
                description: "Retourne toutes les catégories disponibles",
            },
        }
    )
    // Get category by ID
    .get(
        "/:id",
        async ({ params: { id }, set }) => {
            const result = await CategoriesController.getById(id);
            if (!result.success && "status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            params: t.Object({
                id: t.Numeric(),
            }),
            detail: {
                tags: ["Public"],
                summary: "Récupérer une catégorie par ID",
                description: "Retourne les détails d'une catégorie spécifique",
            },
        }
    )
    // Get category by slug
    .get(
        "/slug/:slug",
        async ({ params: { slug }, set }) => {
            const result = await CategoriesController.getBySlug(slug);
            if (!result.success && "status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            params: t.Object({
                slug: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Public"],
                summary: "Récupérer une catégorie par slug",
                description: "Retourne les détails d'une catégorie via son slug",
            },
        }
    )
    // Create a new category
    .post(
        "/",
        async ({ body, set }) => {
            const result = await CategoriesController.create(body);
            if ("status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            body: t.Object({
                name: t.String({ minLength: 1 }),
                slug: t.String({ minLength: 1 }),
                icon: t.String({ minLength: 1 }),
                color: t.Optional(t.String()),
            }),
            detail: {
                tags: ["Admin"],
                summary: "Créer une nouvelle catégorie",
                description: "Crée une nouvelle catégorie dans la base de données",
            },
        }
    )
    // Update a category
    .put(
        "/:id",
        async ({ params: { id }, body, set }) => {
            const result = await CategoriesController.update(id, body);
            if (!result.success && "status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            params: t.Object({
                id: t.Numeric(),
            }),
            body: t.Partial(
                t.Object({
                    name: t.String({ minLength: 1 }),
                    slug: t.String({ minLength: 1 }),
                    icon: t.String({ minLength: 1 }),
                    color: t.String(),
                })
            ),
            detail: {
                tags: ["Admin"],
                summary: "Mettre à jour une catégorie",
                description: "Met à jour les informations d'une catégorie existante",
            },
        }
    )
    // Delete a category
    .delete(
        "/:id",
        async ({ params: { id }, set }) => {
            const result = await CategoriesController.delete(id);
            if (!result.success && "status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            params: t.Object({
                id: t.Numeric(),
            }),
            detail: {
                tags: ["Admin"],
                summary: "Supprimer une catégorie",
                description: "Supprime une catégorie de la base de données",
            },
        }
    );

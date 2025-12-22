import { Elysia, t } from "elysia";
import { CountriesController } from "@/server/controllers/countries.controller";

export const countriesService = new Elysia({ prefix: "/countries" })
    // Get all countries
    .get(
        "/",
        async () => {
            return await CountriesController.getAll();
        },
        {
            detail: {
                tags: ["Admin"],
                summary: "Récupérer tous les pays",
                description: "Retourne la liste de tous les pays disponibles",
            },
        }
    )
    // Get country by ID
    .get(
        "/:id",
        async ({ params: { id }, set }) => {
            const result = await CountriesController.getById(id);
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
                summary: "Récupérer un pays par ID",
                description: "Retourne les détails d'un pays spécifique",
            },
        }
    )
    // Get country by slug
    .get(
        "/slug/:slug",
        async ({ params: { slug }, set }) => {
            const result = await CountriesController.getBySlug(slug);
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
                tags: ["Admin"],
                summary: "Récupérer un pays par slug",
                description: "Retourne les détails d'un pays par son slug",
            },
        }
    )
    // Get country by code
    .get(
        "/code/:code",
        async ({ params: { code }, set }) => {
            const result = await CountriesController.getByCode(code);
            if (!result.success && "status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            params: t.Object({
                code: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Admin"],
                summary: "Récupérer un pays par code",
                description: "Retourne les détails d'un pays par son code ISO",
            },
        }
    )
    // Create a new country
    .post(
        "/",
        async ({ body, set }) => {
            const result = await CountriesController.create(body);
            if ("status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            body: t.Object({
                name: t.String({ minLength: 1 }),
                flag: t.String({ minLength: 1 }),
                currency: t.String({ minLength: 1 }),
                code: t.String({ minLength: 1 }),
                host: t.Optional(t.Nullable(t.String())),
            }),
            detail: {
                tags: ["Admin"],
                summary: "Créer un nouveau pays",
                description: "Crée un nouveau pays dans la base de données",
            },
        }
    )
    // Update a country
    .put(
        "/:id",
        async ({ params: { id }, body, set }) => {
            const result = await CountriesController.update(id, body);
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
                    flag: t.String({ minLength: 1 }),
                    currency: t.String({ minLength: 1 }),
                    code: t.String({ minLength: 1 }),
                    host: t.Nullable(t.String()),
                })
            ),
            detail: {
                tags: ["Admin"],
                summary: "Mettre à jour un pays",
                description: "Met à jour les informations d'un pays existant",
            },
        }
    )
    // Delete a country
    .delete(
        "/:id",
        async ({ params: { id }, set }) => {
            const result = await CountriesController.delete(id);
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
                summary: "Supprimer un pays",
                description: "Supprime un pays de la base de données",
            },
        }
    );

import { Elysia, t } from "elysia";

import { NewspapersController } from "@/server/controllers/newspapers.controller";
import { Status } from "@/server/models/newspaper.model";
import { generatePdfToken } from "@/lib/token-generate";
import { betterAuthPlugin } from "@/lib/plugins/better-auth-plugin";

export const newspapersService = new Elysia({ prefix: "/newspapers" })
    .use(betterAuthPlugin)
    // Cron job: Publish all draft newspapers daily at 4:00 AM
    // Cron job: Publish all draft newspapers (Called by Vercel Cron)
    .get(
        "/cron/publish-drafts",
        async ({ request, set }) => {
            console.log("[Cron] Requête reçue sur /cron/publish-drafts");

            // Sécurisation via CRON_SECRET (envoyé par Vercel)
            const authHeader = request.headers.get("Authorization");
            const cronSecret = process.env.CRON_SECRET;

            console.log("[Cron] Auth Check:", {
                hasAuthHeader: !!authHeader,
                hasSecret: !!cronSecret
            });

            // Si un secret est configuré, on vérifie qu'il correspond
            if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
                console.warn("[Cron] Tentative d'accès non autorisée (Token invalide ou absent)");
                set.status = 401;
                return { success: false, error: "Unauthorized" };
            }

            if (!cronSecret) {
                console.warn("[Cron] Attention: CRON_SECRET non configuré, exécution non sécurisée");
            }

            console.log("[Cron] Démarrage de la tâche de publication automatique (via HTTP)");
            return await NewspapersController.publishAllDraftNewspapers();
        },
        {
            detail: {
                tags: ["System"],
                summary: "Publier les brouillons (Cron)",
                description: "Endpoint appelé par Vercel Cron pour publier les brouillons",
            },
        }
    )
    // Get all published newspapers and magazines (public)
    .get(
        "/all-published",
        async () => {
            return await NewspapersController.getPublishedNewspapersAndMagazines();
        },
        {
            detail: {
                tags: ["Public"],
                summary: "Récupérer les journaux et magazines publiés",
                description: "Retourne tous les journaux publiés avec leurs relations (catégories, organisation, pays, etc.)",
            },
        }
    )
    // Get all published newspapers (public)
    .get(
        "/all-published-newspapers",
        async () => {
            return await NewspapersController.getPublishedNewspapers();
        },
        {
            detail: {
                tags: ["Public"],
                summary: "Récupérer les journaux publiés",
                description: "Retourne tous les journaux publiés avec leurs relations (catégories, organisation, pays, etc.)",
            },
        }
    )
    // Get all published magazines (public)
    .get(
        "/all-published-magazines",
        async () => {
            return await NewspapersController.getPublishedMagazines();
        },
        {
            detail: {
                tags: ["Public"],
                summary: "Récupérer les magazines publiés",
                description: "Retourne tous les magazines publiés avec leurs relations (catégories, organisation, pays, etc.)",
            },
        }
    )
    // Get published newspapers/magazines with pagination (for infinite scroll)
    .get(
        "/published-paginated",
        async ({ query }) => {
            const limit = query.limit ? parseInt(query.limit) : 12;
            const cursor = query.cursor ? parseInt(query.cursor) : 0;
            const type = (query.type as "Journal" | "Magazine") || "Journal";
            const search = query.search;
            return await NewspapersController.getPublishedNewspapersPaginated({
                limit,
                cursor,
                type,
                search,
            });
        },
        {
            query: t.Object({
                limit: t.Optional(t.String()),
                cursor: t.Optional(t.String()),
                type: t.Optional(t.String()),
                search: t.Optional(t.String()),
            }),
            detail: {
                tags: ["Public"],
                summary: "Récupérer les journaux/magazines publiés (paginé)",
                description: "Retourne les éléments publiés avec pagination pour le défilement infini. Type: 'Journal' ou 'Magazine'",
            },
        }
    )
    // Get all newspapers (admin)
    .get(
        "/all",
        async () => {
            return await NewspapersController.getAll();
        },
        {
            detail: {
                tags: ["Admin"],
                summary: "Récupérer tous les journaux",
                description: "Retourne tous les journaux (admin)",
            },
        }
    )
    // Get newspaper by ID
    .get(
        "/:id",
        async ({ params: { id }, set }) => {
            const result = await NewspapersController.getById(id);
            if (!result.success && "status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            params: t.Object({
                id: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Public"],
                summary: "Récupérer un journal par ID",
                description: "Retourne les détails d'un journal spécifique avec toutes ses relations",
            },
        }
    )
    // Get newspapers by organization (with pagination for infinite scroll)
    .get(
        "/organization/:organizationId",
        async ({ params: { organizationId }, query }) => {
            const limit = query.limit ? parseInt(query.limit) : 6;
            const cursor = query.cursor ? parseInt(query.cursor) : 0;
            const excludeId = query.excludeId;
            return await NewspapersController.getByOrganization(organizationId, {
                limit,
                cursor,
                excludeId,
            });
        },
        {
            params: t.Object({
                organizationId: t.String({ minLength: 1 }),
            }),
            query: t.Object({
                limit: t.Optional(t.String()),
                cursor: t.Optional(t.String()),
                excludeId: t.Optional(t.String()),
            }),
            detail: {
                tags: ["Public"],
                summary: "Récupérer les journaux d'une organisation (paginé)",
                description: "Retourne les journaux publiés d'une organisation avec pagination pour le défilement infini",
            },
        }
    )
    // Get newspapers by country
    .get(
        "/country/:countryId",
        async ({ params: { countryId } }) => {
            return await NewspapersController.getByCountry(countryId);
        },
        {
            params: t.Object({
                countryId: t.Numeric(),
            }),
            detail: {
                tags: ["Public"],
                summary: "Récupérer les journaux d'un pays",
                description: "Retourne tous les journaux publiés d'un pays spécifique",
            },
        }
    )
    // Create a new newspaper
    .post(
        "/",
        async ({ body, set }) => {
            const result = await NewspapersController.create(body);
            if ("status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            body: t.Object({
                issueNumber: t.String({ minLength: 1 }),
                publishDate: t.String({ minLength: 1 }),
                coverImageFile: t.Optional(t.Array(t.Any())),
                coverImageUploadId: t.Optional(t.Numeric()),
                price: t.Number({ minimum: 0 }),
                status: t.Enum(Status),
                pdfFile: t.Optional(t.Array(t.Any())),
                pdfUploadId: t.Optional(t.Numeric()),
                categoryIds: t.Array(t.Number()),
                organizationId: t.String({ minLength: 1 }),
                country: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Admin"],
                summary: "Créer un nouveau journal",
                description: "Crée un nouveau journal dans la base de données",
            },
        }
    )
    // Update a newspaper
    .put(
        "/:id",
        async ({ params: { id }, body, set }) => {
            const result = await NewspapersController.update(id, body);
            if (!result.success && "status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            params: t.Object({
                id: t.String({ minLength: 1 }),
            }),
            body: t.Partial(
                t.Object({
                    issueNumber: t.String({ minLength: 1 }),
                    publishDate: t.String({ minLength: 1 }),
                    coverImageFile: t.Optional(t.Array(t.Any())),
                    coverImageUploadId: t.Optional(t.Numeric()),
                    price: t.Number({ minimum: 0 }),
                    status: t.Enum(Status),
                    pdfFile: t.Optional(t.Array(t.Any())),
                    pdfUploadId: t.Optional(t.Numeric()),
                    categoryIds: t.Array(t.Number()),
                    organizationId: t.String({ minLength: 1 }),
                    country: t.String({ minLength: 1 }),
                })
            ),
            detail: {
                tags: ["Admin"],
                summary: "Mettre à jour un journal",
                description: "Met à jour les informations d'un journal existant",
            },
        }
    )
    // Update newspaper status
    .patch(
        "/:id/status",
        async ({ params: { id }, body: { status }, set }) => {
            const result = await NewspapersController.updateStatus(id, status);
            if (!result.success && "status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            params: t.Object({
                id: t.String({ minLength: 1 }),
            }),
            body: t.Object({
                status: t.Enum(Status),
            }),
            detail: {
                tags: ["Admin"],
                summary: "Mettre à jour le statut d'un journal",
                description: "Met à jour uniquement le statut d'un journal",
            },
        }
    )
    // Delete a newspaper
    .delete(
        "/:id",
        async ({ params: { id }, set }) => {
            const result = await NewspapersController.delete(id);
            if (!result.success && "status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            params: t.Object({
                id: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Admin"],
                summary: "Supprimer un journal",
                description: "Supprime un journal de la base de données",
            },
        }
    )
    // Generate PDF token (requires authentication)
    .post(
        "/:id/token",
        async ({ params: { id }, user, set }) => {
            try {
                const token = await generatePdfToken(user.id, id);
                return { success: true, token };
            } catch (error) {
                console.error("Error generating PDF token:", error);
                set.status = 500;
                return { success: false, error: "Erreur lors de la génération du token" };
            }
        },
        {
            auth: true,
            params: t.Object({
                id: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Protected"],
                summary: "Générer un token PDF",
                description: "Génère un token JWT pour accéder au PDF d'un journal (nécessite une authentification)",
            },
        }
    )
    // View newspaper PDF (secured with token)
    .get(
        "/:id/view",
        async ({ params: { id }, query: { token }, set }) => {
            const result = await NewspapersController.viewNewspaper(id, token);

            if (!result.success) {
                set.status = result.status || 401;
                return { error: result.error };
            }

            // Return the stream directly using Response object
            return new Response(result.stream, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": "inline; filename=secure.pdf",
                }
            });
        },
        {
            params: t.Object({
                id: t.String({ minLength: 1 }),
            }),
            query: t.Object({
                token: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Public"],
                summary: "Visualiser le PDF d'un journal",
                description: "Stream le fichier PDF depuis S3 après vérification du token JWT",
            },
        }
    );

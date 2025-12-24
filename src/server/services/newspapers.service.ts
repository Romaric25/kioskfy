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
            // Sécurisation via CRON_SECRET (envoyé par Vercel)
            const authHeader = request.headers.get("Authorization");
            const cronSecret = process.env.CRON_SECRET;

            // Si un secret est configuré, on vérifie qu'il correspond
            if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
                set.status = 401;
                return { success: false, error: "Unauthorized" };
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

    // Get all published newspapers (public)
    .get(
        "/all-published",
        async () => {
            return await NewspapersController.getPublished();
        },
        {
            detail: {
                tags: ["Public"],
                summary: "Récupérer les journaux publiés",
                description: "Retourne tous les journaux publiés avec leurs relations (catégories, organisation, pays, etc.)",
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
    // Get newspapers by organization
    .get(
        "/organization/:organizationId",
        async ({ params: { organizationId } }) => {
            return await NewspapersController.getByOrganization(organizationId);
        },
        {
            params: t.Object({
                organizationId: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Admin"],
                summary: "Récupérer les journaux d'une organisation",
                description: "Retourne tous les journaux d'une organisation spécifique",
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
                coverImageFile: t.Array(t.Any(), { minItems: 1 }),
                price: t.Number({ minimum: 0 }),
                status: t.Enum(Status),
                pdfFile: t.Array(t.Any(), { minItems: 1 }),
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
                    coverImageFile: t.Array(t.Any()),
                    price: t.Number({ minimum: 0 }),
                    status: t.Enum(Status),
                    pdfFile: t.Array(t.Any()),
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

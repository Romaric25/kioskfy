import { Elysia, t } from "elysia";
import { OrganizationsController } from "@/server/controllers/organizations.controller";
import { betterAuthPlugin } from "@/lib/plugins/better-auth-plugin";

/**
 * Organizations Service - Routes Elysia pour les opérations sur les organisations
 * Utilise le OrganizationsController qui intègre better-auth
 */
export const organizationsService = new Elysia({ prefix: "/organizations" })
    // Mount Better Auth plugin (auth routes will be at /api/auth/*)
    .use(betterAuthPlugin)
    // List all organizations
    .get(
        "/",
        async ({ set }) => {
            const result = await OrganizationsController.listAll();
            if (!result.success && "status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            detail: {
                tags: ["Organizations"],
                summary: "Lister toutes les organisations",
                description: "Retourne la liste complète des organisations",
            },
        }
    )
    // Create organization with logo
    .post(
        "/",
        async ({ body, set, user, request }) => {
            const userId = user.id;

            const result = await OrganizationsController.create(body, userId, request.headers);
            if ("status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            auth: true,
            body: t.Object({
                name: t.String({ minLength: 1 }),
                slug: t.Optional(t.String()),
                email: t.String({ format: "email" }),
                phone: t.String({ minLength: 1 }),
                country: t.String({ minLength: 1 }),
                address: t.String({ minLength: 1 }),
                description: t.String({ minLength: 1 }),
                metadata: t.Optional(t.Record(t.String(), t.Any())),
                logoUploadId: t.Optional(t.Numeric()),
                logoFile: t.Optional(t.File()),
            }),
            detail: {
                tags: ["Organizations"],
                summary: "Créer une organisation avec logo",
                description: "Crée une nouvelle organisation avec upload du logo vers R2 via better-auth",
            },
        }
    )
    // Update organization with logo
    .put(
        "/:id",
        async ({ params: { id }, body, set, request }) => {
            const result = await OrganizationsController.update(id, body, request.headers);
            if ("status" in result && !result.success) {
                set.status = result.status;
            }
            return result;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            body: t.Object({
                name: t.Optional(t.String({ minLength: 1 })),
                email: t.Optional(t.String({ format: "email" })),
                phone: t.Optional(t.String({ minLength: 1 })),
                country: t.Optional(t.String({ minLength: 1 })),
                address: t.Optional(t.String({ minLength: 1 })),
                description: t.Optional(t.String({ minLength: 1 })),
                price: t.Optional(t.Numeric()),
                metadata: t.Optional(t.Record(t.String(), t.Any())),
                logoUploadId: t.Optional(t.Numeric()),
                logoFile: t.Optional(t.File()),
            }),
            detail: {
                tags: ["Organizations"],
                summary: "Mettre à jour une organisation",
                description: "Met à jour une organisation avec possibilité de changer le logo",
            },
        }
    )
    // Get organization by ID
    .get(
        "/:id",
        async ({ params: { id }, set }) => {
            const result = await OrganizationsController.getById(id);
            if (!result.success && "status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                tags: ["Organizations"],
                summary: "Récupérer une organisation",
                description: "Retourne les détails d'une organisation avec son logo",
            },
        }
    )
    // Get full organization
    .get(
        "/:id/full",
        async ({ params: { id }, set }) => {
            const result = await OrganizationsController.getFullOrganization(id);
            if (!result.success && "status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                tags: ["Organizations"],
                summary: "Récupérer l'organisation complète",
                description: "Retourne tous les détails de l'organisation via better-auth",
            },
        }
    )
    // Delete organization
    .delete(
        "/:id",
        async ({ params: { id }, set }) => {
            const result = await OrganizationsController.delete(id);
            if (!result.success && "status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                tags: ["Organizations"],
                summary: "Supprimer une organisation",
                description: "Supprime une organisation et son logo associé via better-auth",
            },
        }
    )
    // List organizations by user
    .get(
        "/user/:userId",
        async ({ params: { userId }, set }) => {
            const result = await OrganizationsController.listByUser(userId);
            if (!result.success && "status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            params: t.Object({
                userId: t.String(),
            }),
            detail: {
                tags: ["Organizations"],
                summary: "Lister les organisations d'un utilisateur",
                description: "Retourne toutes les organisations d'un utilisateur via better-auth",
            },
        }
    );

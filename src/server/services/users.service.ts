import { Elysia, t } from "elysia";
import { UsersController } from "@/server/controllers/users.controller";
import { betterAuthPlugin } from "@/lib/plugins/better-auth-plugin";

/**
 * Users Service - Routes Elysia pour les opérations sur les utilisateurs
 */
export const usersService = new Elysia({ prefix: "/users" })
    // Mount Better Auth plugin (auth routes will be at /api/auth/*)
    .use(betterAuthPlugin)
    .post(
        "/partnership",
        async ({ body, set }) => {
            // @ts-ignore - Validating body matches PartnershipRegisterUser structure roughly
            const result = await UsersController.createPartnership(body);
            if ("status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            body: t.Object({
                name: t.String({ minLength: 2 }),
                lastName: t.String({ minLength: 2 }),
                email: t.String({ format: "email" }),
                phone: t.String({ minLength: 1 }),
                password: t.String({ minLength: 8 }),
                confirmPassword: t.String(),
                typeUser: t.Optional(t.String()),
                termsAcceptance: t.Boolean(),
            }),
            detail: {
                tags: ["Users"],
                summary: "Créer un compte partenaire",
                description: "Crée un nouvel utilisateur avec le rôle agence (partenaire)",
            },
        }
    )
    .post(
        "/confirm-email",
        async ({ body, set }) => {
            console.log("!!! DEBUG: Service route /confirm-email reached");
            const result = await UsersController.verifyEmail(body.token);
            set.status = result.status;
            return result;
        },
        {
            body: t.Object({
                token: t.String(),
            }),
            detail: {
                tags: ["Users"],
                summary: "Vérifier l'email",
                description: "Vérifie l'adresse email d'un utilisateur via un token",
            },
        }
    )
    .post(
        "/resend-token",
        async ({ body, set }) => {
            const result = await UsersController.resendToken({
                token: body.token ?? ""
            });
            set.status = result.status;
            return result;
        },
        {
            body: t.Object({
                email: t.Optional(t.String({ format: "email" })),
                token: t.Optional(t.String()),
            }),
            detail: {
                tags: ["Users"],
                summary: "Renvoyer le token de vérification",
                description: "Renvoie un email de vérification à l'utilisateur",
            },
        }
    )
    .get(
        "/me",
        ({ user, set }) => {
            set.status = 200;
            return {
                success: true,
                status: 200,
                data: user
            };
        },
        {
            auth: true,
            detail: {
                tags: ["Users"],
                summary: "Obtenir les informations de l'utilisateur connecté",
                description: "Obtient les informations de l'utilisateur connecté",
            },
        }
    )
    .get(
        "/:id",
        async ({ params, set }) => {
            const result = await UsersController.getById(params.id);
            set.status = result.status;
            return result;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                tags: ["Users"],
                summary: "Obtenir un utilisateur par ID",
                description: "Récupère les informations d'un utilisateur via son ID",
            },
        }
    );

import { Elysia } from "elysia";
import { auth } from "../auth";

/**
 * Better Auth plugin for Elysia
 * Mounts the auth handler and provides auth macro for protected routes
 */
export const betterAuthPlugin = new Elysia({ name: "better-auth" })
    // Mount Better Auth handler at /auth path
    .mount('/auth', auth.handler)
    // Create macro for auth-protected routes
    .macro({
        auth: {
            async resolve({ status, request: { headers } }) {
                const session = await auth.api.getSession({ headers });

                if (!session) {
                    return status(401);
                }

                return {
                    user: session.user,
                    session: session.session,
                };
            },
        },
    });

export type BetterAuthPlugin = typeof betterAuthPlugin;

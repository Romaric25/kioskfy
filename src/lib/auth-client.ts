import { createAuthClient } from "better-auth/react";
import {
    adminClient,
    emailOTPClient,
    inferAdditionalFields,
    organizationClient,
} from "better-auth/client/plugins";
import { ac, owner, admin, member, editor } from "./permissions";
import { auth } from "./auth";

const isProduction = process.env.NODE_ENV === 'production';
// Better Auth client
export const authClient = createAuthClient({
    baseURL: isProduction ? process.env.NEXT_PUBLIC_APP_URL : "http://localhost:3000",
    basePath: '/api/auth',
    session: {
        modelName: "sessions",
    },
    account: {
        modelName: "accounts",
    },
    verification: {
        modelName: "verifications",
    },
    plugins: [
        inferAdditionalFields<typeof auth>(),
        organizationClient({
            teams: {
                enabled: true,
            },
            dynamicAccessControl: {
                enabled: true,
            },
            ac,
            roles: {
                owner,
                admin,
                member,
                editor,
            },
        }),
        emailOTPClient(),
        adminClient({
            ac,
        }),
    ],
});

type ErrorTypes = Partial<
    Record<
        keyof typeof authClient.$ERROR_CODES,
        {
            en: string;
            fr: string;
        }
    >
>;
const errorCodes = {
    USER_ALREADY_EXISTS: {
        en: "User already registered",
        fr: "Utilisateur déjà enregistré",
    },
    USER_NOT_FOUND: {
        en: "User not found",
        fr: "Utilisateur non trouvé",
    },
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: {
        en: "User already exists, use another email or phone number",
        fr: "Utilisateur déjà existant, utilisez un autre email ou numéro de téléphone",
    },
    USER_ALREADY_HAS_PASSWORD: {
        en: "User already has password",
        fr: "Utilisateur déjà enregistré",
    },
    INVALID_PASSWORD: {
        en: "Invalid password",
        fr: "Mot de passe invalide",
    },
    INVALID_EMAIL: {
        en: "Invalid email",
        fr: "Email invalide",
    },
    SESSION_EXPIRED: {
        en: "Session expired",
        fr: "Session expirée",
    },
    FAILED_TO_CREATE_SESSION: {
        en: "Failed to create session",
        fr: "Échec de la création de la session",
    },
    FAILED_TO_CREATE_USER: {
        en: "Failed to create user",
        fr: "Échec de la création de l'utilisateur",
    },
    INVALID_EMAIL_OR_PASSWORD: {
        en: "Invalid email or password",
        fr: "Email ou mot de passe invalide",
    },
    EMAIL_NOT_VERIFIED: {
        en: "Email not verified. Please verify your email before logging in.",
        fr: "Email non vérifié. Veuillez vérifier votre email avant de vous connecter.",
    },
} satisfies ErrorTypes;

export const getErrorMessage = (code: string, lang: "en" | "fr") => {
    if (code in errorCodes) {
        return errorCodes[code as keyof typeof errorCodes][lang];
    }
    return "";
};

import { createAuthClient } from "better-auth/react";
import {
    adminClient,
    emailOTPClient,
    inferAdditionalFields,
    oneTapClient,
    organizationClient,
} from "better-auth/client/plugins";
import { ac, owner, admin, member, editor } from "./permissions";
import { auth } from "./auth";

const isProduction = process.env.NODE_ENV === 'production';
// Better Auth client
// En production, on ne définit pas de baseURL pour que les requêtes
// soient relatives au domaine actuel (évite les erreurs CORS entre sous-domaines)
export const authClient = createAuthClient({
    baseURL: isProduction ? undefined : "http://localhost:3000",
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
    // Organization errors (from ORGANIZATION_ERROR_CODES)
    YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_ORGANIZATION: {
        en: "You are not allowed to create a new organization",
        fr: "Vous n'êtes pas autorisé à créer une nouvelle organisation",
    },
    YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_ORGANIZATIONS: {
        en: "You have reached the maximum number of organizations",
        fr: "Vous avez atteint le nombre maximum d'organisations",
    },
    ORGANIZATION_ALREADY_EXISTS: {
        en: "Organization already exists",
        fr: "L'organisation existe déjà",
    },
    ORGANIZATION_SLUG_ALREADY_TAKEN: {
        en: "Organization slug already taken",
        fr: "Le slug de l'organisation est déjà utilisé",
    },
    ORGANIZATION_NOT_FOUND: {
        en: "Organization not found",
        fr: "Organisation non trouvée",
    },
    YOU_ARE_NOT_A_MEMBER_OF_THIS_ORGANIZATION: {
        en: "You are not a member of this organization",
        fr: "Vous n'êtes pas un membre de cette organisation",
    },
    USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION: {
        en: "User is not a member of the organization",
        fr: "L'utilisateur n'est pas membre de l'organisation",
    },
    MEMBER_NOT_FOUND: {
        en: "Member not found",
        fr: "Membre non trouvé",
    },
    ROLE_NOT_FOUND: {
        en: "Role not found",
        fr: "Rôle non trouvé",
    },
    NO_ACTIVE_ORGANIZATION: {
        en: "No active organization",
        fr: "Aucune organisation active",
    },
    YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER: {
        en: "You cannot leave the organization as the only owner",
        fr: "Impossible de quitter l'organisation en tant que seul propriétaire",
    },
    YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION: {
        en: "You are not allowed to update this organization",
        fr: "Vous n'êtes pas autorisé à mettre à jour cette organisation",
    },
    YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_ORGANIZATION: {
        en: "You are not allowed to delete this organization",
        fr: "Vous n'êtes pas autorisé à supprimer cette organisation",
    },

    // Team errors (from ORGANIZATION_ERROR_CODES)
    YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM: {
        en: "You are not allowed to create a new team",
        fr: "Vous n'êtes pas autorisé à créer une nouvelle équipe",
    },
    TEAM_NOT_FOUND: {
        en: "Team not found",
        fr: "Équipe non trouvée",
    },
    TEAM_ALREADY_EXISTS: {
        en: "Team already exists",
        fr: "L'équipe existe déjà",
    },

    // Invitation errors (from ORGANIZATION_ERROR_CODES)
    INVITATION_NOT_FOUND: {
        en: "Invitation not found",
        fr: "Invitation non trouvée",
    },
    USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION: {
        en: "User is already a member of this organization",
        fr: "L'utilisateur est déjà membre de cette organisation",
    },
    USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION: {
        en: "User is already invited to this organization",
        fr: "L'utilisateur est déjà invité à cette organisation",
    },
    YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION: {
        en: "You are not allowed to invite users to this organization",
        fr: "Vous n'êtes pas autorisé à inviter des utilisateurs à cette organisation",
    },

    // User errors (from BASE_ERROR_CODES)
    USER_NOT_FOUND: {
        en: "User not found",
        fr: "Utilisateur non trouvé",
    },
    USER_ALREADY_EXISTS: {
        en: "User already registered",
        fr: "Utilisateur déjà enregistré",
    },
    USER_ALREADY_HAS_PASSWORD: {
        en: "User already has password",
        fr: "L'utilisateur a déjà un mot de passe",
    },
    FAILED_TO_CREATE_USER: {
        en: "Failed to create user",
        fr: "Échec de la création de l'utilisateur",
    },
    FAILED_TO_UPDATE_USER: {
        en: "Failed to update user",
        fr: "Échec de la mise à jour de l'utilisateur",
    },

    // Password errors (from BASE_ERROR_CODES)
    INVALID_PASSWORD: {
        en: "Invalid password",
        fr: "Mot de passe invalide",
    },
    INVALID_EMAIL_OR_PASSWORD: {
        en: "Invalid email or password",
        fr: "Email ou mot de passe invalide",
    },
    CREDENTIAL_ACCOUNT_NOT_FOUND: {
        en: "No password set for this account",
        fr: "Aucun mot de passe défini pour ce compte",
    },
    PASSWORD_TOO_SHORT: {
        en: "Password is too short",
        fr: "Le mot de passe est trop court",
    },
    PASSWORD_TOO_LONG: {
        en: "Password is too long",
        fr: "Le mot de passe est trop long",
    },

    // Email errors (from BASE_ERROR_CODES)
    INVALID_EMAIL: {
        en: "Invalid email",
        fr: "Email invalide",
    },
    EMAIL_NOT_VERIFIED: {
        en: "Email not verified. Please verify your email before logging in.",
        fr: "Email non vérifié. Veuillez vérifier votre email avant de vous connecter.",
    },
    EMAIL_CAN_NOT_BE_UPDATED: {
        en: "Email cannot be updated",
        fr: "L'email ne peut pas être mis à jour",
    },

    // Session errors (from BASE_ERROR_CODES)
    SESSION_EXPIRED: {
        en: "Session expired",
        fr: "Session expirée",
    },
    FAILED_TO_CREATE_SESSION: {
        en: "Failed to create session",
        fr: "Échec de la création de la session",
    },
    FAILED_TO_GET_SESSION: {
        en: "Failed to get session",
        fr: "Échec de la récupération de la session",
    },

    // Token errors (from BASE_ERROR_CODES)
    INVALID_TOKEN: {
        en: "Invalid token",
        fr: "Jeton invalide",
    },

    // OAuth errors (from BASE_ERROR_CODES)
    SOCIAL_ACCOUNT_ALREADY_LINKED: {
        en: "This account is already linked to another user",
        fr: "Ce compte est déjà lié à un autre utilisateur",
    },
    PROVIDER_NOT_FOUND: {
        en: "Authentication provider not found",
        fr: "Fournisseur d'authentification non trouvé",
    },

    // Account errors (from BASE_ERROR_CODES)
    ACCOUNT_NOT_FOUND: {
        en: "Account not found",
        fr: "Compte non trouvé",
    },

    // Admin errors (from ADMIN_ERROR_CODES)
    BANNED_USER: {
        en: "You have been banned from this application",
        fr: "Vous avez été banni de cette application",
    },
    YOU_ARE_NOT_ALLOWED_TO_DELETE_USERS: {
        en: "You are not allowed to delete users",
        fr: "Vous n'êtes pas autorisé à supprimer des utilisateurs",
    },
    YOU_ARE_NOT_ALLOWED_TO_BAN_USERS: {
        en: "You are not allowed to ban users",
        fr: "Vous n'êtes pas autorisé à bannir des utilisateurs",
    },

} satisfies ErrorTypes;

// Codes d'erreur personnalisés (non définis dans better-auth)
const customErrorCodes: Record<string, { en: string; fr: string }> = {
    UNPROCESSABLE_ENTITY: {
        en: "The request could not be processed",
        fr: "Un compte avec cet email ou numéro de téléphone existe déjà",
    },
    FORBIDDEN: {
        en: "Access forbidden",
        fr: "Accès interdit",
    },
};

export const getErrorMessage = (code: string, lang: "en" | "fr") => {
    if (code in errorCodes) {
        return errorCodes[code as keyof typeof errorCodes][lang];
    }
    if (code in customErrorCodes) {
        return customErrorCodes[code][lang];
    }
    return "";
};

// Mapping des messages d'erreur bruts vers le français
const errorMessages: Record<string, string> = {
    "User already exists.": "Un utilisateur avec cet email existe déjà.",
    "User already exists. Use another email.": "Un utilisateur avec cet email existe déjà. Veuillez utiliser une autre adresse email.",
    "Veuillez vérifier votre adresse email avant de vous connecter.": "Veuillez vérifier votre adresse email avant de vous connecter.",
    "Invalid email or password": "Email ou mot de passe invalide.",
    "Email not verified": "Veuillez vérifier votre adresse email.",
    "Phone number already exists": "Ce numéro de téléphone est déjà utilisé.",
};

/**
 * Traduit un message d'erreur brut en français
 */
export const translateErrorMessage = (message: string): string => {
    return errorMessages[message] || message;
};

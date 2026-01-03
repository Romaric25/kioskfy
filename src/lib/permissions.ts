import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const statement = {
    ...defaultStatements,
    agency: ['create', 'update', 'delete', 'publish', 'payout-manage', 'sales-view', 'sales-export'],
    project: ['create', 'update', 'delete', 'archive', 'suspend', 'attribute'],
    organization: ['create', 'update', 'delete'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
    agency: ['publish', 'payout-manage', 'sales-view', 'sales-export'],
    project: ['create', 'update', 'delete', 'archive', 'suspend'],
    organization: ['update'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    ...adminAc.statements,
});
export const superadmin = ac.newRole({
    project: ['create', 'update', 'delete', 'archive', 'suspend', 'attribute'],
    organization: ['create', 'update', 'delete'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    ...adminAc.statements,
});

export const moderator = ac.newRole({
    project: ['archive'],
    ...adminAc.statements,
});
export const owner = ac.newRole({
    agency: ['create', 'update', 'delete', 'publish', 'payout-manage', 'sales-view', 'sales-export'],
    organization: ['create', 'update', 'delete'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    ...adminAc.statements,
});

export const editor = ac.newRole({
    agency: ['publish', 'payout-manage', 'sales-view'],
    organization: ['update'],
});

export const member = ac.newRole({
    agency: ['sales-view', 'publish'],
});

export const user = ac.newRole({
    ...adminAc.statements,
});

// ============================================================================
// PERMISSION HELPERS - Client-side permission checking utilities
// ============================================================================

// Types de permissions dérivés du statement
export type AgencyPermission = typeof statement.agency[number];
export type ProjectPermission = typeof statement.project[number];
export type OrganizationPermission = typeof statement.organization[number];
export type MemberPermission = typeof statement.member[number];
export type InvitationPermission = typeof statement.invitation[number];

// Constantes pour utilisation facilitée
export const AgencyPermissions = {
    CREATE: "create" as const,
    UPDATE: "update" as const,
    DELETE: "delete" as const,
    PUBLISH: "publish" as const,
    PAYOUT_MANAGE: "payout-manage" as const,
    SALES_VIEW: "sales-view" as const,
    SALES_EXPORT: "sales-export" as const,
};

export const ProjectPermissions = {
    CREATE: "create" as const,
    UPDATE: "update" as const,
    DELETE: "delete" as const,
    ARCHIVE: "archive" as const,
    SUSPEND: "suspend" as const,
    ATTRIBUTE: "attribute" as const,
};

export const MemberPermissions = {
    CREATE: "create" as const,
    UPDATE: "update" as const,
    DELETE: "delete" as const,
};

export const InvitationPermissions = {
    CREATE: "create" as const,
    CANCEL: "cancel" as const,
};

// Type pour les permissions d'organisation (pour les helpers)
export interface PermissionCheckInput {
    agency?: AgencyPermission[];
    project?: ProjectPermission[];
    organization?: OrganizationPermission[];
    member?: MemberPermission[];
    invitation?: InvitationPermission[];
}

// Résultat de la vérification de permission
export interface PermissionCheckResult {
    success: boolean;
    error?: string;
}


type AuthClientType = {
    organization: {
        hasPermission: (params: { permissions: PermissionCheckInput }) => Promise<any>;
    };
    admin: {
        hasPermission: (params: { permissions: Record<string, string[]> }) => Promise<any>;
    };
};

/**
 * Vérifie si l'utilisateur a les permissions spécifiées pour l'organisation active
 * IMPORTANT: Cette fonction doit être appelée côté client uniquement
 * 
 * @example
 * ```ts
 * import { checkOrganizationPermission, AgencyPermissions } from "@/lib/permissions";
 * import { authClient } from "@/lib/auth-client";
 * 
 * const result = await checkOrganizationPermission(authClient, {
 *   agency: [AgencyPermissions.PAYOUT_MANAGE]
 * });
 * 
 * if (result.success) {
 *   // L'utilisateur a les permissions
 * }
 * ```
 */
export async function checkOrganizationPermission(
    authClient: AuthClientType,
    permissions: PermissionCheckInput
): Promise<PermissionCheckResult> {
    try {
        const permissionResult = await authClient.organization.hasPermission({
            permissions,
        });

        // Handle both success and error responses from better-auth
        // Success: { data: { success: true, error: null } }
        // Error: { error: { code: string, message: string }, data: null }
        const success = permissionResult?.data?.success ?? false;

        return {
            success,
        };
    } catch (error) {
        console.error("Permission check failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Permission check failed",
        };
    }
}

// Type pour les permissions de projet
export interface ProjectPermissionCheckInput {
    project?: ProjectPermission[];
}

/**
 * Vérifie si l'utilisateur a les permissions spécifiées pour un projet
 * IMPORTANT: Cette fonction doit être appelée côté client uniquement
 * 
 * @example
 * ```ts
 * import { checkProjectPermission, ProjectPermissions } from "@/lib/permissions";
 * import { authClient } from "@/lib/auth-client";
 * 
 * const result = await checkProjectPermission(authClient, {
 *   project: [ProjectPermissions.ARCHIVE]
 * });
 * 
 * if (result.success) {
 *   // L'utilisateur a les permissions
 * }
 * ```
 */
export async function checkProjectPermission(
    authClient: AuthClientType,
    permissions: ProjectPermissionCheckInput
): Promise<PermissionCheckResult> {
    try {
        // Convert to Record<string, string[]> for admin.hasPermission
        const permissionsRecord: Record<string, string[]> = {};
        if (permissions.project) {
            permissionsRecord.project = permissions.project;
        }

        const permissionResult = await authClient.admin.hasPermission({
            permissions: permissionsRecord,
        });

        const success = permissionResult?.data?.success ?? false;

        return {
            success,
        };
    } catch (error) {
        console.error("Project permission check failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Project permission check failed",
        };
    }
}

/**
 * Vérifie plusieurs permissions et retourne un objet avec chaque résultat
 * 
 * @example
 * ```ts
 * const permissions = await checkMultiplePermissions(authClient, {
 *   canManagePayouts: { agency: [AgencyPermissions.PAYOUT_MANAGE] },
 *   canViewSales: { agency: [AgencyPermissions.SALES_VIEW] },
 * });
 * 
 * if (permissions.canManagePayouts) {
 *   // ...
 * }
 * ```
 */
export async function checkMultiplePermissions<T extends Record<string, PermissionCheckInput>>(
    authClient: AuthClientType,
    permissionsMap: T
): Promise<Record<keyof T, boolean>> {
    const entries = Object.entries(permissionsMap);
    const results = await Promise.all(
        entries.map(async ([key, permissions]) => {
            const result = await checkOrganizationPermission(authClient, permissions);
            return [key, result.success] as const;
        })
    );

    return Object.fromEntries(results) as Record<keyof T, boolean>;
}

/**
 * Crée des fonctions de vérification de permission prédéfinies
 * Utile pour créer des helpers réutilisables dans l'application
 * 
 * @example
 * ```ts
 * const permissionCheckers = createPermissionCheckers(authClient);
 * 
 * if (await permissionCheckers.canManagePayouts()) {
 *   // ...
 * }
 * ```
 */
export function createPermissionCheckers(
    authClient: AuthClientType
) {
    return {
        canManagePayouts: async () => {
            const result = await checkOrganizationPermission(authClient, {
                agency: [AgencyPermissions.PAYOUT_MANAGE],
            });
            return result.success;
        },

        canViewSales: async () => {
            const result = await checkOrganizationPermission(authClient, {
                agency: [AgencyPermissions.SALES_VIEW],
            });
            return result.success;
        },

        canExportSales: async () => {
            const result = await checkOrganizationPermission(authClient, {
                agency: [AgencyPermissions.SALES_EXPORT],
            });
            return result.success;
        },

        canPublish: async () => {
            const result = await checkOrganizationPermission(authClient, {
                agency: [AgencyPermissions.PUBLISH],
            });
            return result.success;
        },

        canManageMembers: async () => {
            const result = await checkOrganizationPermission(authClient, {
                member: [MemberPermissions.CREATE, MemberPermissions.UPDATE, MemberPermissions.DELETE],
            });
            return result.success;
        },

        canManageInvitations: async () => {
            const result = await checkOrganizationPermission(authClient, {
                invitation: [InvitationPermissions.CREATE, InvitationPermissions.CANCEL],
            });
            return result.success;
        },

        canManageProjects: async () => {
            const result = await checkOrganizationPermission(authClient, {
                project: [ProjectPermissions.CREATE, ProjectPermissions.UPDATE, ProjectPermissions.DELETE],
            });
            return result.success;
        },

        canArchiveNewspaper: async () => {
            const result = await checkOrganizationPermission(authClient, {
                project: [ProjectPermissions.ARCHIVE],
            });
            return result.success;
        },

        canSuspendAgency: async () => {
            const result = await checkOrganizationPermission(authClient, {
                project: [ProjectPermissions.SUSPEND],
            });
            return result.success;
        },

        checkCustom: async (permissions: PermissionCheckInput) => {
            const result = await checkOrganizationPermission(authClient, permissions);
            return result.success;
        },
    };
}

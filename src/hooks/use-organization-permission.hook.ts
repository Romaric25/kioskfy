"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import {
    checkOrganizationPermission,
    PermissionCheckInput
} from "@/lib/permissions";

interface UseOrganizationPermissionOptions {
    permissions: PermissionCheckInput;
}

interface UseOrganizationPermissionResult {
    hasPermission: boolean;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Hook réutilisable pour vérifier les permissions d'une organisation
 * Utilise le helper checkOrganizationPermission de lib/permissions.ts
 * 
 * @example
 * ```tsx
 * import { AgencyPermissions } from "@/lib/permissions";
 * 
 * const { hasPermission, isLoading } = useOrganizationPermission({
 *   permissions: { agency: [AgencyPermissions.PAYOUT_MANAGE] }
 * });
 * 
 * if (isLoading) return <Spinner />;
 * if (!hasPermission) return <AccessDenied />;
 * ```
 */
export function useOrganizationPermission(
    options: UseOrganizationPermissionOptions
): UseOrganizationPermissionResult {
    const [hasPermission, setHasPermission] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const checkPermission = async () => {
        setIsLoading(true);
        setError(null);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await checkOrganizationPermission(authClient as any, options.permissions);

        if (result.error) {
            setError(new Error(result.error));
        }
        setHasPermission(result.success);
        setIsLoading(false);
    };

    useEffect(() => {
        let isMounted = true;

        const performCheck = async () => {
            setIsLoading(true);
            setError(null);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await checkOrganizationPermission(authClient as any, options.permissions);

            if (isMounted) {
                if (result.error) {
                    setError(new Error(result.error));
                }
                setHasPermission(result.success);
                setIsLoading(false);
            }
        };

        performCheck();

        return () => {
            isMounted = false;
        };
    }, [JSON.stringify(options.permissions)]);

    return {
        hasPermission,
        isLoading,
        error,
        refetch: checkPermission,
    };
}

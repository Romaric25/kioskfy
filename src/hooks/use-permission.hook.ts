import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";

type PermissionAction = string;

interface PermissionConfig {
    [key: string]: PermissionAction[];
}

interface UsePermissionOptions {
    permission: PermissionConfig;
}

interface UsePermissionReturn {
    hasPermission: boolean;
    isLoadingPermission: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook to check organization permissions
 * @param options - Permission configuration
 * @returns Permission state and loading status
 *
 * @example
 * // Check if user can publish
 * const { hasPermission, isLoadingPermission } = usePermission({
 *   permission: { agency: ["publish"] }
 * });
 *
 * @example
 * // Check multiple permissions
 * const { hasPermission } = usePermission({
 *   permission: { agency: ["publish", "edit"] }
 * });
 */
export const usePermission = (
    options: UsePermissionOptions
): UsePermissionReturn => {
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [isLoadingPermission, setIsLoadingPermission] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const checkPermission = async () => {
        setIsLoadingPermission(true);
        setError(null);

        try {
            const result = await authClient.organization.hasPermission({
                permission: options.permission,
            });
            setHasPermission(result?.data?.success ?? false);
        } catch (err) {
            console.error("Error checking permission:", err);
            setError(err instanceof Error ? err : new Error("Permission check failed"));
            setHasPermission(false);
        } finally {
            setIsLoadingPermission(false);
        }
    };

    useEffect(() => {
        checkPermission();
    }, [JSON.stringify(options.permission)]);

    return {
        hasPermission,
        isLoadingPermission,
        error,
        refetch: checkPermission,
    };
};

/**
 * Shorthand hook to check if user can publish
 */
export const useCanPublish = (): UsePermissionReturn => {
    return usePermission({
        permission: { agency: ["publish"] },
    });
};

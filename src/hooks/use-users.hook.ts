import { useMutation, useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { authClient } from "@/lib/auth-client";
import { User } from "@/server/models/user.model";

// Type utilisateur sans le mot de passe (retourné par l'API)
export type UserProfile = Omit<User, "password">;

/**
 * Hook pour récupérer un utilisateur par son ID
 */
export const useUser = (userId: string) => {
    const {
        data: user,
        isLoading,
        error,
        refetch,
    } = useQuery<UserProfile>({
        queryKey: ["user", userId],
        queryFn: async () => {
            const { data, error } = await client.api.v1.users({ id: userId }).get()
            if (error || !data?.success || !data?.data) {
                throw new Error("Utilisateur non trouvé")
            }
            return data.data as UserProfile
        },
        enabled: !!userId,
    })
    return { user, isLoading, error, refetch }
}

interface AssignRoleInput {
    userId: string
    role: string
}

interface UseAssignRoleOptions {
    onSuccess?: () => void
    onError?: (error: Error) => void
}

/**
 * Hook pour assigner un rôle à un utilisateur
 */
export const useAssignRole = (options?: UseAssignRoleOptions) => {
    const {
        mutate: assignRole,
        mutateAsync: assignRoleAsync,
        isPending: isAssigningRole,
    } = useMutation({
        mutationFn: async ({ userId, role }: AssignRoleInput) => {
            const { error } = await authClient.admin.setRole({
                userId,
                role: role as "admin",
            })
            if (error) {
                throw new Error(error.message ?? "Une erreur est survenue lors de l'attribution du rôle")
            }
        },
        onSuccess: options?.onSuccess,
        onError: options?.onError,
    })
    return { assignRole, assignRoleAsync, isAssigningRole }
}

/**
 * Interface pour les données de session
 */
export interface UserSession {
    id: string
    token: string
    userId: string
    expiresAt: Date
    ipAddress?: string | null
    userAgent?: string | null
    createdAt: Date
    updatedAt: Date
}

/**
 * Hook pour récupérer les sessions d'un utilisateur
 */
export const useUserSessions = (userId: string) => {
    const {
        data: sessions,
        isLoading,
        error,
        refetch,
    } = useQuery<UserSession[]>({
        queryKey: ["user-sessions", userId],
        queryFn: async () => {
            const { data, error } = await authClient.admin.listUserSessions({ userId })
            if (error) {
                throw new Error(error.message ?? "Impossible de récupérer les sessions")
            }
            return (data?.sessions || []) as UserSession[]
        },
        enabled: !!userId,
    })
    return { sessions, isLoading, error, refetch }
}

interface UseRevokeSessionOptions {
    onSuccess?: () => void
    onError?: (error: Error) => void
}

/**
 * Hook pour révoquer une session utilisateur
 */
export const useRevokeUserSession = (options?: UseRevokeSessionOptions) => {
    const {
        mutate: revokeSession,
        mutateAsync: revokeSessionAsync,
        isPending: isRevokingSession,
    } = useMutation({
        mutationFn: async (sessionToken: string) => {
            const { error } = await authClient.admin.revokeUserSession({ sessionToken })
            if (error) {
                throw new Error(error.message ?? "Impossible de révoquer la session")
            }
        },
        onSuccess: options?.onSuccess,
        onError: options?.onError,
    })
    return { revokeSession, revokeSessionAsync, isRevokingSession }
}

/**
 * Hook pour vérifier l'email d'un utilisateur
 */
export const useConfirmEmail = () => {
    const {
        mutateAsync: confirmEmail,
        isPending: isConfirmingEmail,
        isSuccess: isConfirmingEmailSuccess,
    } = useMutation({
        mutationFn: async (token: string) => await client.api.v1.users["confirm-email"].post({ token }),
    });
    return { confirmEmail, isConfirmingEmail, isConfirmingEmailSuccess };
};

/**
 * Hook pour renvoyer un token de vérification
 */
export const useResendToken = () => {
    const {
        mutateAsync: resendToken,
        isPending: isResendingToken,
        isSuccess: isResendingTokenSuccess,
    } = useMutation({
        mutationFn: async (input: { token: string }) =>
            await client.api.v1.users["resend-token"].post(input),
    });
    return { resendToken, isResendingToken, isResendingTokenSuccess };
};

/**
 * Interface pour les informations de géolocalisation
 */
export interface GeoIPInfo {
    country: string | null
    countryCode: string | null
    continent: string | null
    continentCode: string | null
    flag: string
}

/**
 * Hook pour récupérer les informations de géolocalisation pour plusieurs IPs
 */
export const useGeoIP = (ips: string[]) => {
    const {
        data: geoData,
        isLoading,
        error,
    } = useQuery<Record<string, GeoIPInfo | null>>({
        queryKey: ["geoip", ips.sort().join(",")],
        queryFn: async () => {
            if (ips.length === 0) return {}

            const { data, error } = await client.api.v1.geoip.batch.post({ ips })
            if (error || !data?.success) {
                throw new Error("Impossible de récupérer les informations de géolocalisation")
            }
            return data.data as Record<string, GeoIPInfo | null>
        },
        enabled: ips.length > 0,
        staleTime: 1000 * 60 * 60, // 1 heure cache
    })
    return { geoData, isLoading, error }
}

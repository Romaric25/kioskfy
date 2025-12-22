import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/client";

/**
 * Hook pour vérifier l'email d'un utilisateur
 */
export const useVerifyEmail = () => {
    const {
        mutateAsync: verifyEmail,
        isPending: isVerifyingEmail,
        isSuccess: isVerifyingEmailSuccess,
    } = useMutation({
        mutationFn: async (token: string) => await client.api.v1.users["verify-email"].post({ token }),
    });
    return { verifyEmail, isVerifyingEmail, isVerifyingEmailSuccess };
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
        mutationFn: async (email: string) => await client.api.v1.users["resend-token"].post({ email }),
    });
    return { resendToken, isResendingToken, isResendingTokenSuccess };
};

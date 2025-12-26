import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/client";

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

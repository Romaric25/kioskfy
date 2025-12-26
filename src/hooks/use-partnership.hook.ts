import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PartnershipRegisterUser } from "@/server/models/user.model";
import { client } from "@/lib/client";
import { translateErrorMessage } from "@/lib/auth-client";


/**
 * Hook pour créer un utilisateur (Partenaire)
 */
export const useCreatePartnership = () => {
  const queryClient = useQueryClient();
  const {
    mutateAsync: createPartnership,
    isPending: isCreatingPartnership,
    isSuccess: isCreatingPartnershipSuccess,
    isError: isCreatingPartnershipError,
    error: errorCreatingPartnership,
  } = useMutation({
    mutationFn: async (data: PartnershipRegisterUser) => {
      const result = await client.api.v1.users.partnership.post(data);

      if (result.error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorValue = result.error.value as any;
        // L'erreur peut venir de plusieurs structures:
        // 1. Backend retourne { success: false, error: "message" }
        // 2. Eden retourne { message: "..." }
        // 3. Erreur brute string
        const errorMessage =
          errorValue?.error ||  // Backend structure
          errorValue?.message || // Eden structure
          (typeof errorValue === 'string' ? errorValue : null) ||
          "Erreur lors de la création du compte partenaire";
        throw new Error(translateErrorMessage(errorMessage));
      }

      const responseData = result.data;
      if (!responseData?.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error((responseData as any)?.error || "Erreur lors de la création du compte");
      }

      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (erreur) => {
      console.log("onError:", erreur);
    },
  });
  return {
    createPartnership,
    isCreatingPartnership,
    isCreatingPartnershipSuccess,
    isCreatingPartnershipError,
    errorCreatingPartnership,
  };
};


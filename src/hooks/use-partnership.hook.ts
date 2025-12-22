import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PartnershipRegisterUser } from "@/server/models/user.model";
import { client } from "@/lib/client";


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
        throw new Error(String(result.error.value) || "Erreur lors de la création du compte partenaire");
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


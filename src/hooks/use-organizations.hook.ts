import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/client";
import { type CreateOrganization, type UpdateOrganization } from "@/server/models/organization.model";

/**
 * Hook pour récupérer toutes les organisations
 */
export const useOrganizations = () => {
  const {
    data: organizations,
    isLoading: isLoadingOrganizations,
    error: errorOrganizations,
    isSuccess: isSuccessOrganizations,
  } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => await authClient.organization.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  return {
    organizations,
    isLoadingOrganizations,
    errorOrganizations,
    isSuccessOrganizations,
  };
};

/**
 * Hook pour récupérer une organisation par son ID
 */
export const useOrganization = () => {
  const {
    data: organization,
    isLoading: isLoadingOrganization,
    error: errorOrganization,
    isSuccess: isSuccessOrganization,
  } = useQuery({
    queryKey: ["organizations", "active"],
    queryFn: async () => await authClient.organization.getFullOrganization(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  return {
    organization,
    isLoadingOrganization,
    errorOrganization,
    isSuccessOrganization,
  };
};

/**
 * Interface pour la création d'organisation avec logo
 */
interface CreateOrganizationWithLogo extends Omit<CreateOrganization, "logo" | "logoUploadId"> {
  logoFile?: File;
}

/**
 * Hook pour créer une organisation avec gestion du logo via le contrôleur
 */
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: createOrganization,
    isPending: isCreatingOrganization,
    isSuccess: isCreatingOrganizationSuccess,
    error: createOrganizationError,
  } = useMutation({
    mutationFn: async (data: CreateOrganizationWithLogo) => {
      // Use the custom Organizations Controller through Eden Client
      const result = await client.api.v1.organizations.post({
        name: data.name,
        slug: data.slug,
        email: data.email,
        phone: data.phone,
        country: data.country,
        address: data.address,
        description: data.description,
        metadata: data.metadata ?? undefined,
        logoFile: data.logoFile,
      });

      if (result.error) {
        const errorValue = result.error.value as unknown;
        const errorMessage = typeof errorValue === 'object' && errorValue !== null
          ? (errorValue as any)?.error || (errorValue as any)?.message || JSON.stringify(errorValue)
          : String(errorValue) || "Erreur lors de la création de l'organisation";
        throw new Error(errorMessage);
      }

      const responseData = result.data;
      if (!responseData?.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error((responseData as any)?.error || "Erreur lors de la création de l'organisation");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (responseData as any).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast.success("Organisation créée avec succès");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création de l'organisation");
    },
  });

  return {
    createOrganization,
    isCreatingOrganization,
    isCreatingOrganizationSuccess,
    createOrganizationError,
  };
};

/**
 * Interface pour la mise à jour d'organisation avec logo
 */
interface UpdateOrganizationWithLogo extends Omit<UpdateOrganization, "logo" | "logoUploadId" | "id"> {
  logoFile?: File;
}

/**
 * Hook pour mettre à jour une organisation avec gestion du logo via le contrôleur
 */
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateOrganization,
    isPending: isUpdatingOrganization,
    isSuccess: isUpdatingOrganizationSuccess,
    error: updateOrganizationError,
  } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrganizationWithLogo }) => {
      const result = await client.api.v1.organizations({ id }).put({
        name: data.name,
        email: data.email,
        phone: data.phone,
        country: data.country,
        address: data.address,
        description: data.description,
        price: data.price,
        metadata: data.metadata ?? undefined,
        logoFile: data.logoFile,
      });

      if (result.error) {
        const errorValue = result.error.value as unknown;
        const errorMessage = typeof errorValue === 'object' && errorValue !== null
          ? (errorValue as any)?.error || (errorValue as any)?.message || JSON.stringify(errorValue)
          : String(errorValue) || "Erreur lors de la mise à jour de l'organisation";
        throw new Error(errorMessage);
      }

      const responseData = result.data;
      if (!responseData?.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error((responseData as any)?.error || "Erreur lors de la mise à jour de l'organisation");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (responseData as any).data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["organizations", id] });
      queryClient.invalidateQueries({ queryKey: ["organizations", "active"] });
      toast.success("Organisation mise à jour avec succès");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour de l'organisation");
    },
  });

  return {
    updateOrganization,
    isUpdatingOrganization,
    isUpdatingOrganizationSuccess,
    updateOrganizationError,
  };
};

/**
 * Hook pour supprimer une organisation via le contrôleur
 */
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: deleteOrganization,
    isPending: isDeletingOrganization,
    isSuccess: isDeletingOrganizationSuccess,
  } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const result = await client.api.v1.organizations({ id }).delete();

      if (result.error) {
        throw new Error(result.error.value?.toString() || "Erreur lors de la suppression de l'organisation");
      }

      const responseData = result.data;
      if (!responseData?.success) {
        throw new Error((responseData as any)?.error || "Erreur lors de la suppression de l'organisation");
      }

      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast.success("Organisation supprimée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de l'organisation");
    },
  });
  return {
    deleteOrganization,
    isDeletingOrganization,
    isDeletingOrganizationSuccess,
  };
};

/**
 * Hook Organization active
 */
export const useActiveOrganization = () => {
  const { data: organisation, isLoading, error } = useQuery({
    queryKey: ["organizations", "active"],
    queryFn: async () => await authClient.organization.getFullOrganization(),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  return {
    organisation,
    isLoading,
    error,
  };
};

/**
 * Hook pour récupérer les membres d'une organisation
 */
export const useMembers = () => {
  const { data: members, isLoading: isLoadingMembers, error: errorMembers } = useQuery({
    queryKey: ["members"],
    queryFn: async () => await authClient.organization.listTeamMembers(),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  return {
    members,
    isLoadingMembers,
    errorMembers,
  };
};

/**
 * Hook pour vérifier si l'organisation active est complète
 */
export const useIsCompletedOrganization = () => {
  const { organisation, isLoading, error } = useActiveOrganization();

  const isCompleted = (): boolean => {
    if (!organisation?.data) return false;

    // Cast to access additional fields not in the TypeScript type
    const org = organisation.data as unknown as Record<string, unknown>;

    // Parse metadata if it's a JSON string
    let metadata: Record<string, unknown> | null = null;
    if (org.metadata) {
      try {
        metadata = typeof org.metadata === 'string'
          ? JSON.parse(org.metadata)
          : org.metadata as Record<string, unknown>;
      } catch {
        metadata = null;
      }
    }

    // Vérifier les champs de base
    const hasBaseFields = Boolean(
      org.name &&
      org.description &&
      org.phone &&
      org.address &&
      org.country
    );

    // Vérifier les champs dans metadata
    const hasMetadataFields = Boolean(
      metadata &&
      metadata.categories &&
      Array.isArray(metadata.categories) &&
      (metadata.categories as unknown[]).length > 0 &&
      metadata.frequency &&
      metadata.language &&
      metadata.type
    );

    return hasBaseFields && hasMetadataFields;
  };

  return {
    isCompleted: isCompleted(),
    isLoading,
    error,
    organisation,
  };
};

/**
 * Interface for public agency data
 */
export interface PublicAgency {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  country: string;
  description: string;
  metadata: Record<string, unknown> | string | null;
  logoUpload?: {
    id: number;
    filename: string;
    thumbnailUrl: string;
  } | null;
}

/**
 * Hook pour récupérer toutes les agences publiques (pour l'affichage sur la homepage)
 */
export const useAllAgencies = () => {
  const {
    data: agenciesResponse,
    isLoading: isLoadingAgencies,
    error: errorAgencies,
  } = useQuery({
    queryKey: ["agencies-public"],
    queryFn: async () => {
      const result = await client.api.v1.organizations.get();
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - données publiques, peuvent être cachées plus longtemps
  });

  // Filter only agencies with isActive metadata
  const agencies = (agenciesResponse?.data || []).filter((org) => {
    if (!org.metadata) return false;
    try {
      const meta = typeof org.metadata === 'string'
        ? JSON.parse(org.metadata)
        : org.metadata;
      return meta?.isActive === true;
    } catch {
      return false;
    }
  }) as PublicAgency[];

  return {
    agencies,
    isLoadingAgencies,
    errorAgencies,
  };
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";

export interface SiteSetting {
    key: string;
    value: any;
    label: string;
    description?: string;
    type: "string" | "boolean" | "number" | "json";
    group: string;
    isPublic: boolean;
}

export const useSettings = () => {
    const queryClient = useQueryClient();

    // Récupérer les paramètres
    const { data: settings, isLoading } = useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            const { data, error } = await client.api.v1.settings.get();
            if (error || !data?.success) throw new Error("Impossible de charger les paramètres");
            return data.data as Record<string, SiteSetting>;
        }
    });

    // Mettre à jour les paramètres
    const { mutateAsync: updateSettings, isPending: isUpdating } = useMutation({
        mutationFn: async (newSettings: Record<string, any>) => {
            const { data, error } = await client.api.v1.settings.put({
                settings: newSettings
            });
            if (error || !data?.success) throw new Error("Erreur lors de la sauvegarde");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        }
    });

    // Initialiser les paramètres par défaut
    const { mutateAsync: seedSettings, isPending: isSeeding } = useMutation({
        mutationFn: async () => {
            const { data, error } = await client.api.v1.settings.seed.post();
            if (error || !data?.success) throw new Error("Erreur d'initialisation");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        }
    });

    return {
        settings,
        isLoading,
        updateSettings,
        isUpdating,
        seedSettings,
        isSeeding
    };
};

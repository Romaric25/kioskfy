import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import toast from "react-hot-toast";

export const favoriteKeys = {
    all: ["favorites"] as const,
    list: () => [...favoriteKeys.all, "list"] as const,
    check: (newspaperId: string) => [...favoriteKeys.all, "check", newspaperId] as const,
};

interface FavoriteItem {
    id: number;
    newspaperId: string;
    createdAt: string;
    newspaper: any;
}

export const useFavorites = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: favoriteKeys.list(),
        queryFn: async () => {
            const response = await client.api.v1.favorites.get();
            return response.data;
        },
    });

    return {
        favorites: data?.data ?? [],
        favoritesLoading: isLoading,
        favoritesError: error,
    };
};

export const useCheckFavorite = (newspaperId: string, enabled: boolean = true) => {
    const { data, isLoading, error } = useQuery({
        queryKey: favoriteKeys.check(newspaperId),
        queryFn: async () => {
            const response = await client.api.v1.favorites.check({ newspaperId }).get();
            return response.data;
        },
        enabled: enabled && !!newspaperId,
        retry: false,
    });

    return {
        isFavorite: data?.isFavorite ?? false,
        isCheckingFavorite: isLoading,
        checkError: error,
    };
};

export const useToggleFavorite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newspaperId: string) => {
            const response = await client.api.v1.favorites({ newspaperId }).toggle.post();
            return response.data;
        },
        onSuccess: (data, newspaperId) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: favoriteKeys.list() });
            queryClient.invalidateQueries({ queryKey: favoriteKeys.check(newspaperId) });

            // Update the check cache immediately
            if (data) {
                queryClient.setQueryData(favoriteKeys.check(newspaperId), {
                    success: true,
                    isFavorite: data.isFavorite,
                });

                // Show toast
                if (data.isFavorite) {
                    toast.success("Ajouté aux favoris");
                } else {
                    toast.success("Retiré des favoris");
                }
            }
        },
        onError: (error) => {
            toast.error("Erreur lors de la modification des favoris");
            console.error("Toggle favorite error:", error);
        },
    });
};

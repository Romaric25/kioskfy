"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import toast from "react-hot-toast";

export const favoriteCountryKeys = {
    all: ["favoriteCountries"] as const,
    list: () => [...favoriteCountryKeys.all, "list"] as const,
    allWithStatus: () => [...favoriteCountryKeys.all, "allWithStatus"] as const,
    newspapers: () => [...favoriteCountryKeys.all, "newspapers"] as const,
};

export interface Country {
    id: number;
    name: string;
    slug: string;
    flag: string;
    currency: string;
    code: string;
    host?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CountryWithFavoriteStatus extends Country {
    isFavorite: boolean;
}

// Get user's favorite countries
export const useFavoriteCountries = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: favoriteCountryKeys.list(),
        queryFn: async () => {
            const response = await client.api.v1["favorite-countries"].get();
            return response.data;
        },
    });

    return {
        favoriteCountries: (data?.data ?? []) as Country[],
        favoriteCountriesLoading: isLoading,
        favoriteCountriesError: error,
    };
};

// Get all countries with favorite status
export const useAllCountriesWithFavoriteStatus = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: favoriteCountryKeys.allWithStatus(),
        queryFn: async () => {
            const response = await client.api.v1["favorite-countries"].all.get();
            return response.data;
        },
    });

    return {
        countries: (data?.data ?? []) as CountryWithFavoriteStatus[],
        countriesLoading: isLoading,
        countriesError: error,
    };
};

// Get newspapers from favorite countries
export const useNewspapersFromFavoriteCountries = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: favoriteCountryKeys.newspapers(),
        queryFn: async () => {
            const response = await client.api.v1["favorite-countries"].newspapers.get();
            return response.data;
        },
    });

    return {
        newspapers: data?.data ?? [],
        newspapersLoading: isLoading,
        newspapersError: error,
    };
};

// Toggle country favorite status
export const useToggleFavoriteCountry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (countryId: number) => {
            const response = await client.api.v1["favorite-countries"]({ countryId: countryId.toString() }).toggle.post();
            return response.data;
        },
        onSuccess: (data, countryId) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: favoriteCountryKeys.list() });
            queryClient.invalidateQueries({ queryKey: favoriteCountryKeys.allWithStatus() });
            queryClient.invalidateQueries({ queryKey: favoriteCountryKeys.newspapers() });

            // Show toast
            if (data) {
                if (data.isFavorite) {
                    toast.success("Pays ajouté aux favoris");
                } else {
                    toast.success("Pays retiré des favoris");
                }
            }
        },
        onError: (error) => {
            toast.error("Erreur lors de la modification");
            console.error("Toggle favorite country error:", error);
        },
    });
};

// Add country to favorites
export const useAddFavoriteCountry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (countryId: number) => {
            const response = await client.api.v1["favorite-countries"]({ countryId: countryId.toString() }).post();
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: favoriteCountryKeys.list() });
            queryClient.invalidateQueries({ queryKey: favoriteCountryKeys.allWithStatus() });
            queryClient.invalidateQueries({ queryKey: favoriteCountryKeys.newspapers() });
            toast.success("Pays ajouté aux favoris");
        },
        onError: (error) => {
            toast.error("Erreur lors de l'ajout");
            console.error("Add favorite country error:", error);
        },
    });
};

// Remove country from favorites
export const useRemoveFavoriteCountry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (countryId: number) => {
            const response = await client.api.v1["favorite-countries"]({ countryId: countryId.toString() }).delete();
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: favoriteCountryKeys.list() });
            queryClient.invalidateQueries({ queryKey: favoriteCountryKeys.allWithStatus() });
            queryClient.invalidateQueries({ queryKey: favoriteCountryKeys.newspapers() });
            toast.success("Pays retiré des favoris");
        },
        onError: (error) => {
            toast.error("Erreur lors de la suppression");
            console.error("Remove favorite country error:", error);
        },
    });
};

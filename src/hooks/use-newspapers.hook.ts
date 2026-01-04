import { client } from "@/lib/client"
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query"
import { NewspaperResponse, UpdateNewspaper, CreateNewspaper, Status } from "@/server/models/newspaper.model"


// Hook for published newspapers and magazines (public)
export const usePublishedNewspapersAndMagazines = () => {
    const { data, isLoading: newspapersLoading, error: newspapersError } = useQuery({
        queryKey: ['newspapers-published-and-magazines'],
        queryFn: () => client.api.v1.newspapers["all-published"].get()
    })
    const newspapersAndMagazines = data?.data;

    return { newspapersAndMagazines, newspapersLoading, newspapersError }
}

// Hook for published newspapers (public)
export const usePublishedNewspapers = () => {
    const { data, isLoading: newspapersLoading, error: newspapersError } = useQuery({
        queryKey: ['newspapers-published'],
        queryFn: () => client.api.v1.newspapers["all-published-newspapers"].get()
    })
    const newspapers = data?.data;

    return { newspapers, newspapersLoading, newspapersError }
}

// Hook for published magazines (public)
export const usePublishedMagazines = () => {
    const { data, isLoading: magazinesLoading, error: magazinesError } = useQuery({
        queryKey: ['magazines-published'],
        queryFn: () => client.api.v1.newspapers["all-published-magazines"].get()
    })
    const magazines = data?.data;

    return { magazines, magazinesLoading, magazinesError }
}

// Response type for paginated published newspapers
interface PaginatedPublishedResponse {
    success: boolean;
    data: NewspaperResponse[];
    nextCursor?: number;
    total: number;
}

// Hook for infinite scroll published newspapers/magazines
export const useInfinitePublishedNewspapers = (
    options: { type?: "Journal" | "Magazine"; limit?: number; search?: string } = {}
) => {
    const { type = "Journal", limit = 12, search } = options;

    return useInfiniteQuery({
        queryKey: ['newspapers-published-infinite', type, search],
        queryFn: async ({ pageParam = 0 }) => {
            const response = await client.api.v1.newspapers["published-paginated"].get({
                query: {
                    cursor: pageParam.toString(),
                    limit: limit.toString(),
                    type,
                    search,
                },
            });
            return response.data as PaginatedPublishedResponse;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    });
}
// Hook for all newspapers (admin)
export const useAllNewspapers = () => {
    const { data, isLoading: newspapersLoading, error: newspapersError } = useQuery({
        queryKey: ['newspapers-all'],
        queryFn: () => client.api.v1.newspapers.all.get()
    })
    const newspapers = data?.data?.data;

    return { newspapers, newspapersLoading, newspapersError }
}

// Hook for single newspaper by ID
export const useNewspaper = (id: string) => {
    const { data: response, isLoading: newspaperLoading, error: newspaperError } = useQuery({
        queryKey: ['newspaper', id],
        queryFn: () => client.api.v1.newspapers({ id }).get(),
        enabled: !!id,
    })
    // Extract newspaper data only if response is successful, cast to NewspaperResponse
    const newspaper = response?.data && response.data.success !== false && 'data' in response.data && response.data.data
        ? response.data.data as NewspaperResponse
        : undefined;
    return { newspaper, newspaperLoading, newspaperError }
}

// Hook for newspapers by organization (simple, non-paginated - kept for backward compatibility)
export const useNewspapersByOrganization = (organizationId: string) => {
    const { data, isLoading: newspapersLoading, error: newspapersError } = useQuery({
        queryKey: ['newspapers-organization', organizationId],
        queryFn: () => client.api.v1.newspapers.organization({ organizationId }).get(),
        enabled: !!organizationId,
    })
    const newspapers = data?.data;
    return { newspapers, newspapersLoading, newspapersError }
}

// Response type for paginated organization newspapers
interface PaginatedNewspapersResponse {
    success: boolean;
    data: NewspaperResponse[];
    nextCursor?: number;
    total: number;
}

// Hook for infinite scroll newspapers by organization
export const useInfiniteNewspapersByOrganization = (
    organizationId: string,
    options: { excludeId?: string; limit?: number } = {}
) => {
    const { excludeId, limit = 6 } = options;

    return useInfiniteQuery({
        queryKey: ['newspapers-organization-infinite', organizationId, excludeId],
        queryFn: async ({ pageParam = 0 }) => {
            const response = await client.api.v1.newspapers.organization({ organizationId }).get({
                query: {
                    cursor: pageParam.toString(),
                    limit: limit.toString(),
                    ...(excludeId ? { excludeId } : {}),
                },
            });
            return response.data as PaginatedNewspapersResponse;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
        enabled: !!organizationId,
    });
}

// Hook for newspapers by country
export const useNewspapersByCountry = (countryId: number) => {
    const { data, isLoading: newspapersLoading, error: newspapersError } = useQuery({
        queryKey: ['newspapers-country', countryId],
        // @ts-expect-error - Treaty merges params for conflicting routes
        queryFn: () => client.api.v1.newspapers.country({ countryId: countryId, slug: "" }).get(),
        enabled: !!countryId,
    })
    const newspapers = data?.data;
    return { newspapers, newspapersLoading, newspapersError }
}

// Response type for paginated country newspapers
interface PaginatedCountryResponse {
    success: boolean;
    data: NewspaperResponse[];
    country?: { id: number; name: string; slug: string; flag: string };
    nextCursor?: number;
    total: number;
}

// Hook for infinite scroll newspapers by country slug
export const useInfiniteNewspapersByCountrySlug = (
    countrySlug: string,
    options: { limit?: number; search?: string } = {}
) => {
    const { limit = 12, search } = options;

    return useInfiniteQuery({
        queryKey: ['newspapers-country-slug-infinite', countrySlug, search],
        queryFn: async ({ pageParam = 0 }) => {
            // @ts-expect-error - Treaty merges params for conflicting routes
            const response = await client.api.v1.newspapers.country({ slug: countrySlug, countryId: 0 }).get({
                query: {
                    cursor: pageParam.toString(),
                    limit: limit.toString(),
                    search,
                },
            });
            return response.data as PaginatedCountryResponse;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
        enabled: !!countrySlug,
    });
}

// Response type for paginated category newspapers
interface PaginatedCategoryResponse {
    success: boolean;
    data: NewspaperResponse[];
    category?: { id: number; name: string; slug: string };
    nextCursor?: number;
    total: number;
}

// Hook for infinite scroll newspapers by category
export const useInfiniteNewspapersByCategory = (
    categorySlug: string,
    options: { limit?: number; search?: string } = {}
) => {
    const { limit = 12, search } = options;

    return useInfiniteQuery({
        queryKey: ['newspapers-category-infinite', categorySlug, search],
        queryFn: async ({ pageParam = 0 }) => {
            const response = await client.api.v1.newspapers.category({ slug: categorySlug }).get({
                query: {
                    cursor: pageParam.toString(),
                    limit: limit.toString(),
                    search,
                },
            });
            return response.data as PaginatedCategoryResponse;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
        enabled: !!categorySlug,
    });
}

// Hook for updating a newspaper
export const useUpdateNewspaper = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateNewspaper }) => {
            return client.api.v1.newspapers({ id: id.toString() }).put(data);
        },
        onSuccess: (_, variables) => {
            // Invalidate related queries to refresh the data
            queryClient.invalidateQueries({ queryKey: ['newspapers-published'] });
            queryClient.invalidateQueries({ queryKey: ['newspapers-all'] });
            queryClient.invalidateQueries({ queryKey: ['newspaper', variables.id.toString()] });
            queryClient.invalidateQueries({ queryKey: ['newspapers-organization'] });
        },
    });

    return {
        updateNewspaper: mutation.mutateAsync,
        isUpdatingNewspaper: mutation.isPending,
        isUpdatingNewspaperSuccess: mutation.isSuccess,
        updateNewspaperError: mutation.error,
    };
}

// Hook for creating a newspaper
export const useCreateNewspaper = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: CreateNewspaper) => {
            return client.api.v1.newspapers.post(data);
        },
        onSuccess: () => {
            // Invalidate related queries to refresh the data
            queryClient.invalidateQueries({ queryKey: ['newspapers-published'] });
            queryClient.invalidateQueries({ queryKey: ['newspapers-all'] });
            queryClient.invalidateQueries({ queryKey: ['newspapers-organization'] });
        },
    });

    return {
        createNewspaper: mutation.mutateAsync,
        isCreatingNewspaper: mutation.isPending,
        isCreatingNewspaperSuccess: mutation.isSuccess,
        createNewspaperError: mutation.error,
    };
}

// Hook for updating newspaper status
export const useUpdateNewspaperStatus = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: Status }) => {
            return client.api.v1.newspapers({ id }).status.patch({ status });
        },
        onSuccess: (_, variables) => {
            // Invalidate related queries to refresh the data
            queryClient.invalidateQueries({ queryKey: ['newspapers-published'] });
            queryClient.invalidateQueries({ queryKey: ['newspapers-all'] });
            queryClient.invalidateQueries({ queryKey: ['newspaper', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['newspapers-organization'] });
        },
    });

    return {
        updateNewspaperStatus: mutation.mutateAsync,
        isUpdatingNewspaperStatus: mutation.isPending,
        isUpdatingNewspaperStatusSuccess: mutation.isSuccess,
        updateNewspaperStatusError: mutation.error,
    };
}

// Function to fetch PDF token from server (JWT_SECRET is only available server-side)
export async function fetchPdfToken(newspaperId: string): Promise<string> {
    const response = await client.api.v1.newspapers({ id: newspaperId }).token.post();

    if (response.error || !response.data) {
        throw new Error("Erreur lors de la récupération du token PDF");
    }

    if ('success' in response.data && !response.data.success) {
        throw new Error((response.data as { error?: string }).error || "Erreur lors de la récupération du token PDF");
    }

    if ('token' in response.data && response.data.token) {
        return response.data.token;
    }

    throw new Error("Token non trouvé dans la réponse");
}

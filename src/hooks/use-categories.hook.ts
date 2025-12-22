import { client } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"

// Hook for all categories
export const useCategories = () => {
    const { data, isLoading: categoriesLoading, error: categoriesError } = useQuery({
        queryKey: ['categories'],
        queryFn: () => client.api.v1.categories.get()
    })
    const categories = data?.data?.data;
    return { categories, categoriesLoading, categoriesError }
}

// Hook for single category by ID
export const useCategory = (id: number) => {
    const { data, isLoading: categoryLoading, error: categoryError } = useQuery({
        queryKey: ['category', id],
        queryFn: () => client.api.v1.categories({ id: id.toString() }).get(),
        enabled: !!id,
    })
    const category = data?.data?.data;
    return { category, categoryLoading, categoryError }
}

// Hook for single category by slug
export const useCategoryBySlug = (slug: string) => {
    const { data, isLoading: categoryLoading, error: categoryError } = useQuery({
        queryKey: ['category-slug', slug],
        queryFn: () => client.api.v1.categories.slug({ slug }).get(),
        enabled: !!slug,
    })
    const category = data?.data?.data;
    return { category, categoryLoading, categoryError }
}

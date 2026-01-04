import { client } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"

// Hook for full country data (admin, etc.)
export const useCountries = () => {
    const { data, isLoading: countriesLoading, error: countriesError } = useQuery({
        queryKey: ['countries'],
        queryFn: () => client.api.v1.countries.get()
    })
    const countries = data?.data;
    return { countries, countriesLoading, countriesError }
}

// Hook for single country by slug
export const useCountryBySlug = (slug: string) => {
    const { data, isLoading: countryLoading, error: countryError } = useQuery({
        queryKey: ['country', slug],
        queryFn: () => client.api.v1.countries.slug({ slug }).get(),
        enabled: !!slug,
    })
    const country = data?.data && 'data' in data.data ? data.data.data : undefined;
    return { country, countryLoading, countryError }
}
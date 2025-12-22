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
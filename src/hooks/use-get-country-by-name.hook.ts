
import { useCountries } from "./use-countries.hook";

export const useGetCountryByName = (name: string) => {
    const { countries, countriesLoading } = useCountries();

    // Handle potential response structure differences
    // @ts-ignore - Temporary fix for type inference issues
    const countriesList = Array.isArray(countries) ? countries : (countries?.data || []);

    // Safe find operation
    // @ts-ignore - Temporary fix for type
    const country = Array.isArray(countriesList) ? countriesList.find((c) => c.name === name) : undefined;

    return { country, isLoading: countriesLoading };
};

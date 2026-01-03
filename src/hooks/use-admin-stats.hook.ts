import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";

export function useAdminStats() {
    return useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => {
            const response = await client.api.v1.admin.stats.get();

            if (response.error) {
                throw response.error;
            }

            let responseData = response.data;

            // Handle SuperJSON format if present
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (responseData && typeof responseData === 'object' && 'json' in responseData) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                responseData = (responseData as any).json;
            }

            return responseData;
        },
    });
}

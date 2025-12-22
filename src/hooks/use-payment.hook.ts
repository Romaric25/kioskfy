import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import type { Payment } from "@/server/models/payment.model";

export const useInitializePayment = () => {
    const {mutateAsync, isPending, isError, error, isSuccess, data} = useMutation({
        mutationFn: async (data: Payment) => {
            const { data: response, error } = await client.api.v1.payments.initialize.post(data);

            if (error) {
                throw new Error(error.value?.message || "Failed to initialize payment");
            }

            return response;
        }
    });
    return {mutateAsync, isPending, isError, error, isSuccess, data};
};

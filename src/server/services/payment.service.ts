import { Elysia, t } from "elysia";
import { PaymentController } from "@/server/controllers/payment.controller";
import { paymentSchema } from "@/server/models/payment.model";

export const paymentService = new Elysia({ prefix: "/payments" })
    .post(
        "/initialize",
        async ({ body, set }) => {
            try {
                const result = await PaymentController.initializePayment(body);
                return result;
            } catch (error: any) {
                set.status = 500;
                return {
                    success: false,
                    message: error.message || "Failed to initialize payment",
                };
            }
        },
        {
            body: paymentSchema,
            detail: {
                tags: ["Payment"],
                summary: "Initialize a payment",
                description: "Initialize a payment session with Moneroo",
            },
        }
    );

import { t } from "elysia";

export const paymentCustomerSchema = t.Object({
    email: t.String({ format: 'email' }),
    first_name: t.String(),
    last_name: t.String(),
    phone: t.Optional(t.String()),
    address: t.Optional(t.String()),
    city: t.Optional(t.String()),
    state: t.Optional(t.String()),
    country: t.Optional(t.String()),
    zip: t.Optional(t.String()),
});

export type PaymentCustomer = typeof paymentCustomerSchema.static;

export const restrictedPhoneSchema = t.Object({
    number: t.String(),
    country_code: t.String(),
});

export type RestrictedPhone = typeof restrictedPhoneSchema.static;

export const paymentSchema = t.Object({
    amount: t.Integer(),
    currency: t.String(),
    description: t.String(),
    return_url: t.String(),
    customer: paymentCustomerSchema,
    metadata: t.Optional(t.Record(t.String(), t.Any())),
    methods: t.Optional(t.Array(t.String())),
    restrict_country_code: t.Optional(t.String()),
    restricted_phone: t.Optional(restrictedPhoneSchema),
});

export type Payment = typeof paymentSchema.static;
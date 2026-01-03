import { z } from "zod";

export enum PublicationLanguage {
    ENGLISH = "Anglais",
    FRENCH = "Français",
}

export enum PublicationType {
    JOURNAL = "Journal",
    MAGAZINE = "Magazine",
}

export enum PublicationFrequency {
    DAILY = "Daily",
    WEEKLY = "Weekly",
    BI_WEEKLY = "Bi-weekly",
    THREE_WEEKLY = "Three-weekly",
    MONTHLY = "Monthly",
    QUARTERLY = "Quarterly",
    YEARLY = "Yearly",
}

export const organizationSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Le nom de l'agence est requis"),
    slug: z.string(),
    email: z.email({ message: "L'email de l'agence est requis" }),
    logo: z.string().nullable().optional(),
    price: z.coerce.number().optional(),
    logoUploadId: z.number().optional(),
    country: z.string().min(1, "Le pays de l'agence est requis"),
    address: z.string().min(1, "L'adresse de l'agence est requise"),
    phone: z.string().min(1, "Le numéro de téléphone de l'agence est requis"),
    description: z.string().min(1, "La description de l'agence est requise"),
    suspended: z.boolean().optional().default(false),
    suspendedReason: z.string().nullable().optional(),
    suspendedUntil: z.date().nullable().optional(),
    metadata: z.record(z.string(), z.any()).nullable().optional(),
    createdAt: z.date(),
    updatedAt: z.date().optional(),
});

export type Organization = z.infer<typeof organizationSchema>;

export const createOrganizationSchema = organizationSchema.omit({
    id: true,
    price: true,
    createdAt: true,
    updatedAt: true,
});

export const createInvitationSchema = z.object({
    organizationId: z.string(),
    email: z.email(),
    role: z.string(),
    resend: z.boolean().optional(),
    teamId: z.string().optional(),
});

export type CreateInvitation = z.infer<typeof createInvitationSchema>;

export type CreateOrganization = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = organizationSchema
    .omit({
        createdAt: true,
        updatedAt: true,
        slug: true,
    })
    .partial()
    .extend({
        id: z.string().min(1, "L'ID de l'organisation est requis"),
    });

export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>;

export const organizationSettingsSchema = organizationSchema
    .pick({
        name: true,
        description: true,
        email: true,
        phone: true,
        address: true,
        country: true,
        price: true,
    })
    .extend({
        categories: z
            .array(z.number())
            .min(1, "Au moins une catégorie est requise"),
        frequency: z.enum(PublicationFrequency, {
            message: "La fréquence de publication est requise",
        }),
        language: z.enum(PublicationLanguage, {
            message: "La langue de publication est requise",
        }),
        type: z.enum(PublicationType, {
            message: "Le type de publication est requis",
        }),
        isActive: z.boolean(),
        allowComments: z.boolean(),
        publishAuto: z.boolean(),
        emailNotifications: z.boolean(),
        smsNotifications: z.boolean(),
        pushNotifications: z.boolean(),
    });

export type OrganizationSettings = z.infer<typeof organizationSettingsSchema>;

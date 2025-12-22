import { z } from "zod";

export const countrySchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Le nom est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  flag: z.string().min(1, "Le drapeau est requis"),
  currency: z.string().min(1, "La devise est requise"),
  code: z.string().min(1, "Le code ISO est requis"),
  host: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Country = z.infer<typeof countrySchema>;

export const createCountrySchema = countrySchema.omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateCountry = z.infer<typeof createCountrySchema>;

export const updateCountrySchema = createCountrySchema.partial();

export type UpdateCountry = z.infer<typeof updateCountrySchema>;

import { db } from "@/lib/db";
import { countries } from "@/db/app-schema";
import { eq } from "drizzle-orm";
import {
    createCountrySchema,
    updateCountrySchema,
    type CreateCountry,
    type UpdateCountry,
} from "@/server/models/country.model";

// Helper function to generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export class CountriesController {
    // Get all countries
    static async getAll() {
        const allCountries = await db.select().from(countries);
        return {
            success: true,
            data: allCountries,
        };
    }

    // Get country by ID
    static async getById(id: number) {
        const country = await db
            .select()
            .from(countries)
            .where(eq(countries.id, id))
            .limit(1);

        if (country.length === 0) {
            return {
                success: false,
                status: 404,
                error: "Pays non trouvé",
            };
        }

        return {
            success: true,
            data: country[0],
        };
    }

    // Get country by slug
    static async getBySlug(slug: string) {
        const country = await db
            .select()
            .from(countries)
            .where(eq(countries.slug, slug))
            .limit(1);

        if (country.length === 0) {
            return {
                success: false,
                status: 404,
                error: "Pays non trouvé",
            };
        }

        return {
            success: true,
            data: country[0],
        };
    }

    // Get country by code
    static async getByCode(code: string) {
        const country = await db
            .select()
            .from(countries)
            .where(eq(countries.code, code.toUpperCase()))
            .limit(1);

        if (country.length === 0) {
            return {
                success: false,
                status: 404,
                error: "Pays non trouvé",
            };
        }

        return {
            success: true,
            data: country[0],
        };
    }

    // Create a new country
    static async create(body: unknown) {
        // Validate with Zod
        const validation = createCountrySchema.safeParse(body);
        if (!validation.success) {
            return {
                success: false,
                status: 400,
                error: "Données invalides",
                details: validation.error.flatten().fieldErrors,
            };
        }

        const data: CreateCountry = validation.data;

        try {
            const slug = generateSlug(data.name);
            const result = await db.insert(countries).values({
                name: data.name,
                slug,
                flag: data.flag,
                currency: data.currency,
                code: data.code.toUpperCase(),
                host: data.host ?? null,
            });

            const insertId = result[0].insertId;
            const newCountry = await db
                .select()
                .from(countries)
                .where(eq(countries.id, insertId))
                .limit(1);

            return {
                success: true,
                status: 201,
                data: newCountry[0],
                message: "Pays créé avec succès",
            };
        } catch (error) {
            return {
                success: false,
                status: 400,
                error: "Erreur lors de la création du pays",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            };
        }
    }

    // Update a country
    static async update(id: number, body: unknown) {
        // Validate with Zod
        const validation = updateCountrySchema.safeParse(body);
        if (!validation.success) {
            return {
                success: false,
                status: 400,
                error: "Données invalides",
                details: validation.error.flatten().fieldErrors,
            };
        }

        const data: UpdateCountry = validation.data;

        try {
            const existingCountry = await db
                .select()
                .from(countries)
                .where(eq(countries.id, id))
                .limit(1);

            if (existingCountry.length === 0) {
                return {
                    success: false,
                    status: 404,
                    error: "Pays non trouvé",
                };
            }

            const updateData: Record<string, unknown> = {};
            if (data.name) {
                updateData.name = data.name;
                updateData.slug = generateSlug(data.name);
            }
            if (data.flag) updateData.flag = data.flag;
            if (data.currency) updateData.currency = data.currency;
            if (data.code) updateData.code = data.code.toUpperCase();
            if (data.host !== undefined) updateData.host = data.host;

            await db
                .update(countries)
                .set(updateData)
                .where(eq(countries.id, id));

            const updatedCountry = await db
                .select()
                .from(countries)
                .where(eq(countries.id, id))
                .limit(1);

            return {
                success: true,
                data: updatedCountry[0],
                message: "Pays mis à jour avec succès",
            };
        } catch (error) {
            return {
                success: false,
                status: 400,
                error: "Erreur lors de la mise à jour du pays",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            };
        }
    }

    // Delete a country
    static async delete(id: number) {
        try {
            const existingCountry = await db
                .select()
                .from(countries)
                .where(eq(countries.id, id))
                .limit(1);

            if (existingCountry.length === 0) {
                return {
                    success: false,
                    status: 404,
                    error: "Pays non trouvé",
                };
            }

            await db.delete(countries).where(eq(countries.id, id));

            return {
                success: true,
                message: "Pays supprimé avec succès",
            };
        } catch (error) {
            return {
                success: false,
                status: 400,
                error: "Erreur lors de la suppression du pays",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            };
        }
    }
}

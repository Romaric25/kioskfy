import { Elysia, t } from "elysia";
import { db } from "@/lib/db";
import { siteSettings } from "@/db/app-schema";
import { eq, inArray } from "drizzle-orm";

/**
 * Service de gestion des paramètres du site
 */
export const settingsService = new Elysia({ prefix: "/settings" })
    /**
     * Récupérer tous les paramètres (Admin)
     */
    .get("/", async () => {
        try {
            const settings = await db.select().from(siteSettings);

            // Transformer en objet clé-valeur pour faciliter l'usage frontend
            const settingsMap = settings.reduce((acc, curr) => {
                acc[curr.key] = {
                    ...curr,
                    // Tenter de parser le JSON si le type est 'json' ou 'boolean'
                    value: parseValue(curr.value, curr.type)
                };
                return acc;
            }, {} as Record<string, any>);

            return {
                success: true,
                data: settingsMap,
            };
        } catch (error) {
            console.error("Error fetching settings:", error);
            return {
                success: false,
                error: "Impossible de récupérer les paramètres",
            };
        }
    }, {
        detail: {
            tags: ["Settings"],
            summary: "Récupérer tous les paramètres",
        }
    })

    /**
     * Mettre à jour plusieurs paramètres (Batch update)
     */
    .put("/", async ({ body }) => {
        const updates = body.settings;
        const results = [];

        try {
            // Utilisation d'une transaction implicite via Promise.all pour la rapidité
            // (ou transaction explicite si critique, mais ici c'est des settings)
            await Promise.all(Object.entries(updates).map(async ([key, value]) => {
                // S'assurer que la valeur est stringifiée si besoin
                let stringValue = String(value);
                if (typeof value === 'object') {
                    stringValue = JSON.stringify(value);
                } else if (typeof value === 'boolean') {
                    stringValue = value ? 'true' : 'false';
                }

                // Vérifier si le paramètre existe
                const existing = await db.query.siteSettings.findFirst({
                    where: eq(siteSettings.key, key)
                });

                if (existing) {
                    await db.update(siteSettings)
                        .set({ value: stringValue })
                        .where(eq(siteSettings.key, key));
                } else {
                    // Création auto si n'existe pas (optionnel, pratique pour le dev)
                    await db.insert(siteSettings).values({
                        key,
                        value: stringValue,
                        type: typeof value === 'boolean' ? 'boolean' : typeof value === 'object' ? 'json' : 'string',
                        label: formatKeyToLabel(key),
                        group: 'general'
                    });
                }
            }));

            return {
                success: true,
                message: "Paramètres mis à jour avec succès"
            };
        } catch (error) {
            console.error("Error updating settings:", error);
            return {
                success: false,
                error: "Erreur lors de la mise à jour des paramètres"
            };
        }
    }, {
        body: t.Object({
            settings: t.Record(t.String(), t.Any())
        }),
        detail: {
            tags: ["Settings"],
            summary: "Mettre à jour des paramètres",
        }
    })

    /**
     * Initialiser les paramètres par défaut (Seed)
     * Utile pour créer les clés manquantes
     */
    .post("/seed", async () => {
        const defaultSettings = [
            { key: "site_name", value: "Kioskfy", label: "Nom du site", group: "general", type: "string", isPublic: true },
            { key: "site_description", value: "Votre kiosque numérique", label: "Description", group: "seo", type: "string", isPublic: true },
            { key: "contact_email", value: "contact@kioskfy.com", label: "Email de contact", group: "general", type: "string", isPublic: true },
            { key: "maintenance_mode", value: "false", label: "Mode maintenance", group: "maintenance", type: "boolean", isPublic: true },
            { key: "facebook_url", value: "", label: "Facebook URL", group: "social", type: "string", isPublic: true },
            { key: "twitter_url", value: "", label: "Twitter URL", group: "social", type: "string", isPublic: true },
            { key: "instagram_url", value: "", label: "Instagram URL", group: "social", type: "string", isPublic: true },
        ];

        let createdCount = 0;

        for (const setting of defaultSettings) {
            const existing = await db.query.siteSettings.findFirst({
                where: eq(siteSettings.key, setting.key)
            });

            if (!existing) {
                await db.insert(siteSettings).values(setting);
                createdCount++;
            }
        }

        return {
            success: true,
            message: `${createdCount} paramètres initialisés`,
        };
    }, {
        detail: {
            tags: ["Settings"],
            summary: "Initialiser les paramètres par défaut",
        }
    });

// Helper pour parser les valeurs
function parseValue(value: string | null, type: string) {
    if (value === null) return null;
    if (type === 'boolean') return value === 'true';
    if (type === 'number') return Number(value);
    if (type === 'json') {
        try { return JSON.parse(value); } catch { return value; }
    }
    return value;
}

// Helper pour formatter key -> label (ex: site_name -> Site Name)
function formatKeyToLabel(key: string) {
    return key.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

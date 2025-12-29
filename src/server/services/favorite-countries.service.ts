import { Elysia, t } from "elysia";
import { betterAuthPlugin } from "@/lib/plugins/better-auth-plugin";
import { db } from "@/lib/db";
import { userFavoriteCountries, countries, newspapers } from "@/db/app-schema";
import { eq, and, inArray, desc } from "drizzle-orm";

export const favoriteCountriesService = new Elysia({ prefix: "/favorite-countries" })
    .use(betterAuthPlugin)
    // Get user's favorite countries
    .get(
        "/",
        async ({ user }) => {
            try {
                const userFavorites = await db.query.userFavoriteCountries.findMany({
                    where: eq(userFavoriteCountries.userId, user.id),
                    with: {
                        country: true,
                    },
                    orderBy: (ufc, { desc }) => [desc(ufc.createdAt)],
                });

                return {
                    success: true,
                    data: userFavorites.map((fav) => fav.country),
                };
            } catch (error) {
                console.error("Error fetching favorite countries:", error);
                return { success: false, error: "Erreur lors de la récupération des pays favoris" };
            }
        },
        {
            auth: true,
            detail: {
                tags: ["Protected"],
                summary: "Récupérer les pays favoris de l'utilisateur",
                description: "Retourne tous les pays favoris de l'utilisateur connecté",
            },
        }
    )
    // Get all countries with favorite status
    .get(
        "/all",
        async ({ user }) => {
            try {
                const allCountries = await db.query.countries.findMany({
                    orderBy: (countries, { asc }) => [asc(countries.name)],
                });

                const userFavorites = await db.query.userFavoriteCountries.findMany({
                    where: eq(userFavoriteCountries.userId, user.id),
                });

                const favoriteCountryIds = new Set(userFavorites.map((f) => f.countryId));

                return {
                    success: true,
                    data: allCountries.map((country) => ({
                        ...country,
                        isFavorite: favoriteCountryIds.has(country.id),
                    })),
                };
            } catch (error) {
                console.error("Error fetching countries:", error);
                return { success: false, error: "Erreur lors de la récupération des pays" };
            }
        },
        {
            auth: true,
            detail: {
                tags: ["Protected"],
                summary: "Récupérer tous les pays avec statut favori",
                description: "Retourne tous les pays avec indication s'ils sont favoris",
            },
        }
    )
    // Add country to favorites
    .post(
        "/:countryId",
        async ({ user, params: { countryId }, set }) => {
            try {
                const countryIdNum = parseInt(countryId);

                // Check if country exists
                const country = await db.query.countries.findFirst({
                    where: eq(countries.id, countryIdNum),
                });

                if (!country) {
                    set.status = 404;
                    return { success: false, error: "Pays non trouvé" };
                }

                // Check if already favorite
                const existingFavorite = await db.query.userFavoriteCountries.findFirst({
                    where: and(
                        eq(userFavoriteCountries.userId, user.id),
                        eq(userFavoriteCountries.countryId, countryIdNum)
                    ),
                });

                if (existingFavorite) {
                    return { success: true, message: "Déjà dans les pays favoris" };
                }

                // Add to favorites
                await db.insert(userFavoriteCountries).values({
                    userId: user.id,
                    countryId: countryIdNum,
                });

                return { success: true, message: "Pays ajouté aux favoris" };
            } catch (error) {
                console.error("Error adding country to favorites:", error);
                set.status = 500;
                return { success: false, error: "Erreur lors de l'ajout du pays aux favoris" };
            }
        },
        {
            auth: true,
            params: t.Object({
                countryId: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Protected"],
                summary: "Ajouter un pays aux favoris",
                description: "Ajoute un pays aux favoris de l'utilisateur",
            },
        }
    )
    // Remove country from favorites
    .delete(
        "/:countryId",
        async ({ user, params: { countryId }, set }) => {
            try {
                const countryIdNum = parseInt(countryId);

                await db
                    .delete(userFavoriteCountries)
                    .where(
                        and(
                            eq(userFavoriteCountries.userId, user.id),
                            eq(userFavoriteCountries.countryId, countryIdNum)
                        )
                    );

                return { success: true, message: "Pays retiré des favoris" };
            } catch (error) {
                console.error("Error removing country from favorites:", error);
                set.status = 500;
                return { success: false, error: "Erreur lors de la suppression du pays des favoris" };
            }
        },
        {
            auth: true,
            params: t.Object({
                countryId: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Protected"],
                summary: "Retirer un pays des favoris",
                description: "Retire un pays des favoris de l'utilisateur",
            },
        }
    )
    // Toggle country favorite
    .post(
        "/:countryId/toggle",
        async ({ user, params: { countryId }, set }) => {
            try {
                const countryIdNum = parseInt(countryId);

                // Check if country exists
                const country = await db.query.countries.findFirst({
                    where: eq(countries.id, countryIdNum),
                });

                if (!country) {
                    set.status = 404;
                    return { success: false, error: "Pays non trouvé", isFavorite: false };
                }

                // Check if already favorite
                const existingFavorite = await db.query.userFavoriteCountries.findFirst({
                    where: and(
                        eq(userFavoriteCountries.userId, user.id),
                        eq(userFavoriteCountries.countryId, countryIdNum)
                    ),
                });

                if (existingFavorite) {
                    // Remove from favorites
                    await db
                        .delete(userFavoriteCountries)
                        .where(
                            and(
                                eq(userFavoriteCountries.userId, user.id),
                                eq(userFavoriteCountries.countryId, countryIdNum)
                            )
                        );
                    return { success: true, isFavorite: false, message: "Pays retiré des favoris" };
                } else {
                    // Add to favorites
                    await db.insert(userFavoriteCountries).values({
                        userId: user.id,
                        countryId: countryIdNum,
                    });
                    return { success: true, isFavorite: true, message: "Pays ajouté aux favoris" };
                }
            } catch (error) {
                console.error("Error toggling country favorite:", error);
                set.status = 500;
                return { success: false, error: "Erreur lors de la modification" };
            }
        },
        {
            auth: true,
            params: t.Object({
                countryId: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Protected"],
                summary: "Basculer le statut favori d'un pays",
                description: "Ajoute ou retire un pays des favoris",
            },
        }
    )
    // Get newspapers from favorite countries
    .get(
        "/newspapers",
        async ({ user }) => {
            try {
                // Get user's favorite country IDs
                const userFavorites = await db.query.userFavoriteCountries.findMany({
                    where: eq(userFavoriteCountries.userId, user.id),
                });

                if (userFavorites.length === 0) {
                    return { success: true, data: [] };
                }

                const favoriteCountryIds = userFavorites.map((f) => f.countryId);

                // Get newspapers from those countries
                const newspapersFromFavoriteCountries = await db.query.newspapers.findMany({
                    where: and(
                        inArray(newspapers.countryId, favoriteCountryIds),
                        eq(newspapers.status, "published")
                    ),
                    with: {
                        organization: true,
                        country: true,
                        categories: {
                            with: {
                                category: true,
                            },
                        },
                    },
                    orderBy: (newspapers, { desc }) => [desc(newspapers.publishDate)],
                    limit: 12,
                });

                return {
                    success: true,
                    data: newspapersFromFavoriteCountries,
                };
            } catch (error) {
                console.error("Error fetching newspapers from favorite countries:", error);
                return { success: false, error: "Erreur lors de la récupération des journaux" };
            }
        },
        {
            auth: true,
            detail: {
                tags: ["Protected"],
                summary: "Récupérer les journaux des pays favoris",
                description: "Retourne les journaux des pays favoris de l'utilisateur",
            },
        }
    );

import { Elysia, t } from "elysia";
import { betterAuthPlugin } from "@/lib/plugins/better-auth-plugin";
import { db } from "@/lib/db";
import { favorites, newspapers } from "@/db/app-schema";
import { eq, and } from "drizzle-orm";

export const favoritesService = new Elysia({ prefix: "/favorites" })
    .use(betterAuthPlugin)
    // Get user favorites
    .get(
        "/",
        async ({ user }) => {
            try {
                const userFavorites = await db.query.favorites.findMany({
                    where: eq(favorites.userId, user.id),
                    with: {
                        newspaper: {
                            with: {
                                organization: true,
                                country: true,
                                categories: {
                                    with: {
                                        category: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: (favorites, { desc }) => [desc(favorites.createdAt)],
                });

                return {
                    success: true,
                    data: userFavorites.map((fav) => ({
                        id: fav.id,
                        newspaperId: fav.newspaperId,
                        createdAt: fav.createdAt,
                        newspaper: {
                            ...fav.newspaper,
                            // Flatten categories from junction table structure to direct category objects
                            categories: fav.newspaper.categories?.map((cat) => cat.category) ?? [],
                        },
                    })),
                };
            } catch (error) {
                console.error("Error fetching favorites:", error);
                return { success: false, error: "Erreur lors de la récupération des favoris" };
            }
        },
        {
            auth: true,
            detail: {
                tags: ["Protected"],
                summary: "Récupérer les favoris de l'utilisateur",
                description: "Retourne tous les journaux favoris de l'utilisateur connecté",
            },
        }
    )
    // Check if newspaper is favorite
    .get(
        "/check/:newspaperId",
        async ({ user, params: { newspaperId } }) => {
            try {
                const favorite = await db.query.favorites.findFirst({
                    where: and(
                        eq(favorites.userId, user.id),
                        eq(favorites.newspaperId, newspaperId)
                    ),
                });

                return {
                    success: true,
                    isFavorite: !!favorite,
                };
            } catch (error) {
                console.error("Error checking favorite:", error);
                return { success: false, isFavorite: false };
            }
        },
        {
            auth: true,
            params: t.Object({
                newspaperId: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Protected"],
                summary: "Vérifier si un journal est en favori",
                description: "Vérifie si un journal est dans les favoris de l'utilisateur",
            },
        }
    )
    // Add to favorites
    .post(
        "/:newspaperId",
        async ({ user, params: { newspaperId }, set }) => {
            try {
                // Check if newspaper exists
                const newspaper = await db.query.newspapers.findFirst({
                    where: eq(newspapers.id, newspaperId),
                });

                if (!newspaper) {
                    set.status = 404;
                    return { success: false, error: "Journal non trouvé" };
                }

                // Check if already favorite
                const existingFavorite = await db.query.favorites.findFirst({
                    where: and(
                        eq(favorites.userId, user.id),
                        eq(favorites.newspaperId, newspaperId)
                    ),
                });

                if (existingFavorite) {
                    return { success: true, message: "Déjà dans les favoris" };
                }

                // Add to favorites
                await db.insert(favorites).values({
                    userId: user.id,
                    newspaperId: newspaperId,
                });

                return { success: true, message: "Ajouté aux favoris" };
            } catch (error) {
                console.error("Error adding to favorites:", error);
                set.status = 500;
                return { success: false, error: "Erreur lors de l'ajout aux favoris" };
            }
        },
        {
            auth: true,
            params: t.Object({
                newspaperId: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Protected"],
                summary: "Ajouter aux favoris",
                description: "Ajoute un journal aux favoris de l'utilisateur",
            },
        }
    )
    // Remove from favorites
    .delete(
        "/:newspaperId",
        async ({ user, params: { newspaperId }, set }) => {
            try {
                const result = await db
                    .delete(favorites)
                    .where(
                        and(
                            eq(favorites.userId, user.id),
                            eq(favorites.newspaperId, newspaperId)
                        )
                    );

                return { success: true, message: "Retiré des favoris" };
            } catch (error) {
                console.error("Error removing from favorites:", error);
                set.status = 500;
                return { success: false, error: "Erreur lors de la suppression des favoris" };
            }
        },
        {
            auth: true,
            params: t.Object({
                newspaperId: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Protected"],
                summary: "Retirer des favoris",
                description: "Retire un journal des favoris de l'utilisateur",
            },
        }
    )
    // Toggle favorite
    .post(
        "/:newspaperId/toggle",
        async ({ user, params: { newspaperId }, set }) => {
            try {
                // Check if newspaper exists
                const newspaper = await db.query.newspapers.findFirst({
                    where: eq(newspapers.id, newspaperId),
                });

                if (!newspaper) {
                    set.status = 404;
                    return { success: false, error: "Journal non trouvé", isFavorite: false };
                }

                // Check if already favorite
                const existingFavorite = await db.query.favorites.findFirst({
                    where: and(
                        eq(favorites.userId, user.id),
                        eq(favorites.newspaperId, newspaperId)
                    ),
                });

                if (existingFavorite) {
                    // Remove from favorites
                    await db
                        .delete(favorites)
                        .where(
                            and(
                                eq(favorites.userId, user.id),
                                eq(favorites.newspaperId, newspaperId)
                            )
                        );
                    return { success: true, isFavorite: false, message: "Retiré des favoris" };
                } else {
                    // Add to favorites
                    await db.insert(favorites).values({
                        userId: user.id,
                        newspaperId: newspaperId,
                    });
                    return { success: true, isFavorite: true, message: "Ajouté aux favoris" };
                }
            } catch (error) {
                console.error("Error toggling favorite:", error);
                set.status = 500;
                return { success: false, error: "Erreur lors de la modification des favoris" };
            }
        },
        {
            auth: true,
            params: t.Object({
                newspaperId: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Protected"],
                summary: "Basculer le statut favori",
                description: "Ajoute ou retire un journal des favoris",
            },
        }
    );

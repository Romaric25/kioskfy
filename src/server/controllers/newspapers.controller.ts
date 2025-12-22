import { db } from "@/lib/db";
import {
    newspapers,
    newspapersCategories,
    categories,
    countries,
    uploads,
} from "@/db/app-schema";
import { organizations } from "@/db/auth-schema";
import { eq, desc, and, sql } from "drizzle-orm";
import {
    createNewspaperSchema,
    updateNewspaperSchema,
    Status,
    type CreateNewspaper,
    type UpdateNewspaper,
} from "@/server/models/newspaper.model";
import { createId } from "@paralleldrive/cuid2";
import { verifyPdfToken } from "@/lib/token-generate";
import { UploadsController } from "@/server/controllers/uploads.controller";

export class NewspapersController {
    // Get all published newspapers with relations (for public)
    static async getPublished() {
        const publishedNewspapers = await db
            .select({
                id: newspapers.id,
                coverImage: newspapers.coverImage,
                price: newspapers.price,
                publishDate: newspapers.publishDate,
                issueNumber: newspapers.issueNumber,
                pdf: newspapers.pdf,
                status: newspapers.status,
                createdAt: newspapers.createdAt,
                updatedAt: newspapers.updatedAt,
                // Organization data
                organization: {
                    id: organizations.id,
                    name: organizations.name,
                    slug: organizations.slug,
                    logo: organizations.logo,
                    metadata: organizations.metadata,
                },
                // Country data
                country: {
                    id: countries.id,
                    name: countries.name,
                    slug: countries.slug,
                    flag: countries.flag,
                    code: countries.code,
                },
                // PDF Upload data
                pdfUpload: {
                    id: uploads.id,
                    filename: uploads.filename,
                    thumbnailUrl: uploads.thumbnailUrl,
                },
            })
            .from(newspapers)
            .leftJoin(organizations, eq(newspapers.organizationId, organizations.id))
            .leftJoin(countries, eq(newspapers.countryId, countries.id))
            .leftJoin(uploads, eq(newspapers.pdfUploadId, uploads.id))
            .where(
                and(
                    eq(newspapers.status, Status.PUBLISHED),
                    // Check if organization metadata contains isActive: true
                    sql`JSON_EXTRACT(${organizations.metadata}, '$.isActive') = true`
                )
            )
            .orderBy(desc(newspapers.publishDate));

        // Fetch categories for each newspaper
        const newspapersWithCategories = await Promise.all(
            publishedNewspapers.map(async (newspaper) => {
                const newspaperCategories = await db
                    .select({
                        id: categories.id,
                        name: categories.name,
                        slug: categories.slug,
                        icon: categories.icon,
                        color: categories.color,
                    })
                    .from(newspapersCategories)
                    .innerJoin(categories, eq(newspapersCategories.categoriesId, categories.id))
                    .where(eq(newspapersCategories.newspapersId, newspaper.id));

                return {
                    ...newspaper,
                    categories: newspaperCategories,
                };
            })
        );

        return {
            success: true,
            data: newspapersWithCategories,
        };
    }

    // Get all newspapers (admin)
    static async getAll() {
        const allNewspapers = await db
            .select({
                id: newspapers.id,
                coverImage: newspapers.coverImage,
                price: newspapers.price,
                publishDate: newspapers.publishDate,
                issueNumber: newspapers.issueNumber,
                pdf: newspapers.pdf,
                status: newspapers.status,
                autoPublish: newspapers.autoPublish,
                createdAt: newspapers.createdAt,
                updatedAt: newspapers.updatedAt,
                organization: {
                    id: organizations.id,
                    name: organizations.name,
                    slug: organizations.slug,
                    logo: organizations.logo,
                },
                country: {
                    id: countries.id,
                    name: countries.name,
                    slug: countries.slug,
                    flag: countries.flag,
                    code: countries.code,
                },
            })
            .from(newspapers)
            .leftJoin(organizations, eq(newspapers.organizationId, organizations.id))
            .leftJoin(countries, eq(newspapers.countryId, countries.id))
            .orderBy(desc(newspapers.publishDate));

        return {
            success: true,
            data: allNewspapers,
        };
    }

    // Get newspaper by ID with all relations
    static async getById(id: string) {
        const newspaper = await db
            .select({
                id: newspapers.id,
                coverImage: newspapers.coverImage,
                price: newspapers.price,
                publishDate: newspapers.publishDate,
                issueNumber: newspapers.issueNumber,
                pdf: newspapers.pdf,
                status: newspapers.status,
                autoPublish: newspapers.autoPublish,
                createdAt: newspapers.createdAt,
                updatedAt: newspapers.updatedAt,
                organization: {
                    id: organizations.id,
                    name: organizations.name,
                    slug: organizations.slug,
                    logo: organizations.logo,
                    metadata: organizations.metadata,
                },
                country: {
                    id: countries.id,
                    name: countries.name,
                    slug: countries.slug,
                    flag: countries.flag,
                    code: countries.code,
                },
                pdfUpload: {
                    id: uploads.id,
                    filename: uploads.filename,
                    thumbnailUrl: uploads.thumbnailUrl,
                },
            })
            .from(newspapers)
            .leftJoin(organizations, eq(newspapers.organizationId, organizations.id))
            .leftJoin(countries, eq(newspapers.countryId, countries.id))
            .leftJoin(uploads, eq(newspapers.pdfUploadId, uploads.id))
            .where(eq(newspapers.id, id))
            .limit(1);

        if (newspaper.length === 0) {
            return {
                success: false,
                status: 404,
                error: "Journal non trouvé",
            };
        }

        // Fetch categories
        const newspaperCategories = await db
            .select({
                id: categories.id,
                name: categories.name,
                slug: categories.slug,
                icon: categories.icon,
                color: categories.color,
            })
            .from(newspapersCategories)
            .innerJoin(categories, eq(newspapersCategories.categoriesId, categories.id))
            .where(eq(newspapersCategories.newspapersId, id));

        return {
            success: true,
            data: {
                ...newspaper[0],
                categories: newspaperCategories,
            },
        };
    }

    // Get newspapers by organization ID
    static async getByOrganization(organizationId: string) {
        const orgNewspapers = await db
            .select({
                id: newspapers.id,
                coverImage: newspapers.coverImage,
                price: newspapers.price,
                publishDate: newspapers.publishDate,
                issueNumber: newspapers.issueNumber,
                pdf: newspapers.pdf,
                status: newspapers.status,
                createdAt: newspapers.createdAt,
            })
            .from(newspapers)
            .where(eq(newspapers.organizationId, organizationId))
            .orderBy(desc(newspapers.publishDate));

        return {
            success: true,
            data: orgNewspapers,
        };
    }

    // Get newspapers by country ID
    static async getByCountry(countryId: number) {
        const countryNewspapers = await db
            .select({
                id: newspapers.id,
                coverImage: newspapers.coverImage,
                price: newspapers.price,
                publishDate: newspapers.publishDate,
                issueNumber: newspapers.issueNumber,
                status: newspapers.status,
                organization: {
                    id: organizations.id,
                    name: organizations.name,
                    logo: organizations.logo,
                },
            })
            .from(newspapers)
            .leftJoin(organizations, eq(newspapers.organizationId, organizations.id))
            .where(
                and(
                    eq(newspapers.countryId, countryId),
                    eq(newspapers.status, Status.PUBLISHED),
                    sql`JSON_EXTRACT(${organizations.metadata}, '$.isActive') = true`
                )
            )
            .orderBy(desc(newspapers.publishDate));

        return {
            success: true,
            data: countryNewspapers,
        };
    }

    // Create a new newspaper
    static async create(body: unknown) {
        const validation = createNewspaperSchema.safeParse(body);
        if (!validation.success) {
            return {
                success: false,
                status: 400,
                error: "Données invalides",
                details: validation.error.flatten().fieldErrors,
            };
        }

        const data: CreateNewspaper = validation.data;

        try {
            const newspaperId = createId();

            // 1. Create the newspaper record first (with empty URLs)
            await db.insert(newspapers).values({
                id: newspaperId,
                issueNumber: data.issueNumber,
                publishDate: new Date(data.publishDate),
                coverImage: "",
                price: data.price.toString(),
                pdf: "",
                status: data.status,
                organizationId: data.organizationId,
                countryId: parseInt(data.country),
            });

            // 2. Handle cover image upload (with processing: resize, WebP, thumbnail)
            let coverImageUrl = "";
            let coverImageUploadId: number | null = null;

            if (data.coverImageFile && data.coverImageFile.length > 0) {
                const coverFile = data.coverImageFile[0];

                // If it's a File object, upload it with image processing
                if (coverFile instanceof File || (coverFile && typeof coverFile === 'object' && 'file' in coverFile)) {
                    const fileToUpload = coverFile instanceof File ? coverFile : coverFile.file as File;

                    // Use uploadImage for automatic resize, WebP conversion, and thumbnail
                    const uploadResult = await UploadsController.uploadImage(fileToUpload, {
                        maxWidth: 1200,
                        maxHeight: 1600,
                        quality: 85,
                        createThumbnail: true,
                    });

                    if (uploadResult.success && uploadResult.data) {
                        coverImageUrl = uploadResult.data.url;

                        // Create upload record in database with thumbnail info
                        const uploadRecord = await db.insert(uploads).values({
                            filename: fileToUpload.name.replace(/\.[^/.]+$/, '.webp'),
                            thumbnailS3Key: uploadResult.data.s3Key,
                            thumbnailUrl: uploadResult.data.thumbnailUrl || uploadResult.data.url,
                        });
                        coverImageUploadId = uploadRecord[0].insertId;

                        console.log(`[Newspaper] Cover image processed: ${uploadResult.data.width}x${uploadResult.data.height}`);
                    }
                }
                // If it's a base64 string or URL, use it directly
                else if (typeof coverFile === 'string') {
                    coverImageUrl = coverFile;
                }
            }

            // 3. Handle PDF upload (no processing, upload as-is)
            let pdfUrl = "";
            let pdfUploadId: number | null = null;

            if (data.pdfFile && data.pdfFile.length > 0) {
                const pdfFile = data.pdfFile[0];

                // If it's a File object, upload it
                if (pdfFile instanceof File || (pdfFile && typeof pdfFile === 'object' && 'file' in pdfFile)) {
                    const fileToUpload = pdfFile instanceof File ? pdfFile : pdfFile.file as File;

                    // Use uploadPdf for PDFs (no image processing)
                    const uploadResult = await UploadsController.uploadPdf(fileToUpload);

                    if (uploadResult.success && uploadResult.data) {
                        pdfUrl = uploadResult.data.url;

                        // Create upload record in database
                        const uploadRecord = await db.insert(uploads).values({
                            filename: fileToUpload.name,
                            thumbnailS3Key: uploadResult.data.s3Key,
                            thumbnailUrl: uploadResult.data.url,
                        });
                        pdfUploadId = uploadRecord[0].insertId;

                        console.log(`[Newspaper] PDF uploaded: ${fileToUpload.name}`);
                    }
                }
                // If it's a base64 string or URL, use it directly
                else if (typeof pdfFile === 'string') {
                    pdfUrl = pdfFile;
                }
            }

            // 4. Update the newspaper with file URLs and upload IDs
            const updateData: Record<string, unknown> = {};
            if (coverImageUrl) updateData.coverImage = coverImageUrl;
            if (pdfUrl) updateData.pdf = pdfUrl;
            if (coverImageUploadId) updateData.coverImageUploadId = coverImageUploadId;
            if (pdfUploadId) updateData.pdfUploadId = pdfUploadId;

            if (Object.keys(updateData).length > 0) {
                await db.update(newspapers).set(updateData).where(eq(newspapers.id, newspaperId));
            }

            // 5. Insert category associations
            if (data.categoryIds && data.categoryIds.length > 0) {
                await db.insert(newspapersCategories).values(
                    data.categoryIds.map((categoryId) => ({
                        newspapersId: newspaperId,
                        categoriesId: categoryId,
                    }))
                );
            }

            return {
                success: true,
                status: 201,
                data: { id: newspaperId },
                message: "Journal créé avec succès",
            };
        } catch (error) {
            console.error("Error creating newspaper:", error);
            return {
                success: false,
                status: 400,
                error: "Erreur lors de la création du journal",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            };
        }
    }

    // Update a newspaper
    static async update(id: string, body: unknown) {
        const validation = updateNewspaperSchema.safeParse(body);
        if (!validation.success) {
            return {
                success: false,
                status: 400,
                error: "Données invalides",
                details: validation.error.flatten().fieldErrors,
            };
        }

        const data: UpdateNewspaper = validation.data;

        try {
            const existingNewspaper = await db
                .select()
                .from(newspapers)
                .where(eq(newspapers.id, id))
                .limit(1);

            if (existingNewspaper.length === 0) {
                return {
                    success: false,
                    status: 404,
                    error: "Journal non trouvé",
                };
            }

            const updateData: Record<string, unknown> = {};
            if (data.issueNumber) updateData.issueNumber = data.issueNumber;
            if (data.publishDate) updateData.publishDate = new Date(data.publishDate);
            if (data.price) updateData.price = data.price.toString();
            if (data.status) updateData.status = data.status;
            if (data.country) updateData.countryId = parseInt(data.country);
            if (data.organizationId) updateData.organizationId = data.organizationId;

            if (Object.keys(updateData).length > 0) {
                await db.update(newspapers).set(updateData).where(eq(newspapers.id, id));
            }

            // Update categories if provided
            if (data.categoryIds) {
                // Remove existing associations
                await db
                    .delete(newspapersCategories)
                    .where(eq(newspapersCategories.newspapersId, id));

                // Insert new associations
                if (data.categoryIds.length > 0) {
                    await db.insert(newspapersCategories).values(
                        data.categoryIds.map((categoryId) => ({
                            newspapersId: id,
                            categoriesId: categoryId,
                        }))
                    );
                }
            }

            return {
                success: true,
                message: "Journal mis à jour avec succès",
            };
        } catch (error) {
            return {
                success: false,
                status: 400,
                error: "Erreur lors de la mise à jour du journal",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            };
        }
    }

    // Delete a newspaper
    static async delete(id: string) {
        try {
            const existingNewspaper = await db
                .select()
                .from(newspapers)
                .where(eq(newspapers.id, id))
                .limit(1);

            if (existingNewspaper.length === 0) {
                return {
                    success: false,
                    status: 404,
                    error: "Journal non trouvé",
                };
            }

            // Delete category associations first (cascade should handle this, but being explicit)
            await db
                .delete(newspapersCategories)
                .where(eq(newspapersCategories.newspapersId, id));

            // Delete the newspaper
            await db.delete(newspapers).where(eq(newspapers.id, id));

            return {
                success: true,
                message: "Journal supprimé avec succès",
            };
        } catch (error) {
            return {
                success: false,
                status: 400,
                error: "Erreur lors de la suppression du journal",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            };
        }
    }

    // Update newspaper status
    static async updateStatus(id: string, status: Status) {
        try {
            const existingNewspaper = await db
                .select()
                .from(newspapers)
                .where(eq(newspapers.id, id))
                .limit(1);

            if (existingNewspaper.length === 0) {
                return {
                    success: false,
                    status: 404,
                    error: "Journal non trouvé",
                };
            }

            await db
                .update(newspapers)
                .set({ status })
                .where(eq(newspapers.id, id));

            return {
                success: true,
                message: "Statut du journal mis à jour avec succès",
            };
        } catch (error) {
            return {
                success: false,
                status: 400,
                error: "Erreur lors de la mise à jour du statut",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            };
        }
    }

    /**
     * View newspaper PDF with token validation
     * Streams the PDF file from S3 after verifying the JWT token
     */
    static async viewNewspaper(id: string, token: string) {
        // Validate token presence
        if (!token) {
            console.error("[viewNewspaper] Token manquant");
            return {
                success: false,
                status: 401,
                error: "Token manquant",
            };
        }

        try {
            // Verify the PDF token
            console.log("[viewNewspaper] Vérification du token pour newspaper:", id);
            const payload = await verifyPdfToken(token);
            console.log("[viewNewspaper] Token vérifié, payload:", payload);

            // Get newspaper details
            const newspaper = await db
                .select({
                    id: newspapers.id,
                    pdfUploadId: newspapers.pdfUploadId,
                    pdfUpload: {
                        id: uploads.id,
                        thumbnailS3Key: uploads.thumbnailS3Key,
                    },
                })
                .from(newspapers)
                .leftJoin(uploads, eq(newspapers.pdfUploadId, uploads.id))
                .where(eq(newspapers.id, id))
                .limit(1);

            console.log("[viewNewspaper] Newspaper trouvé:", newspaper);

            if (newspaper.length === 0) {
                console.error("[viewNewspaper] Journal non trouvé:", id);
                return {
                    success: false,
                    status: 404,
                    error: "Journal non trouvé",
                };
            }

            // Verify token matches the newspaper
            if (payload.newspaperId !== newspaper[0].id) {
                console.error("[viewNewspaper] Token newspaperId mismatch:", payload.newspaperId, "vs", newspaper[0].id);
                return {
                    success: false,
                    status: 401,
                    error: "Token PDF invalide",
                };
            }

            const pdfS3Key = newspaper[0].pdfUpload?.thumbnailS3Key;
            console.log("[viewNewspaper] PDF S3 Key:", pdfS3Key, "pdfUploadId:", newspaper[0].pdfUploadId);

            if (!pdfS3Key) {
                console.error("[viewNewspaper] Fichier PDF non trouvé - pdfUploadId:", newspaper[0].pdfUploadId);
                return {
                    success: false,
                    status: 404,
                    error: "Fichier PDF non trouvé",
                };
            }

            // Get the stream from R2
            const s3Stream = await UploadsController.getFileStreamFromR2(pdfS3Key);

            return {
                success: true,
                stream: s3Stream,
            };
        } catch (error) {
            console.error("[viewNewspaper] Erreur complète:", error);
            return {
                success: false,
                status: 401,
                error: "Token expiré ou invalide",
            };
        }
    }

    /**
     * Publish all draft newspapers with autoPublish enabled
     * This is called by the cron job daily at 4:00 AM
     */
    static async publishAllDraftNewspapers(): Promise<{
        success: boolean;
        publishedCount: number;
        newspapers: Array<{ id: string; issueNumber: string }>;
    }> {
        try {
            // Get all draft newspapers with autoPublish enabled
            const draftNewspapers = await db
                .select({
                    id: newspapers.id,
                    issueNumber: newspapers.issueNumber,
                    autoPublish: newspapers.autoPublish,
                })
                .from(newspapers)
                .where(
                    and(
                        eq(newspapers.status, Status.DRAFT),
                        eq(newspapers.autoPublish, true)
                    )
                );

            if (draftNewspapers.length === 0) {
                console.log("[Cron] Aucun journal brouillon à publier");
                return {
                    success: true,
                    publishedCount: 0,
                    newspapers: [],
                };
            }

            // Update all draft newspapers to published status
            const publishedNewspapers = await Promise.all(
                draftNewspapers.map(async (newspaper) => {
                    await db
                        .update(newspapers)
                        .set({ status: Status.PUBLISHED })
                        .where(eq(newspapers.id, newspaper.id));

                    return {
                        id: newspaper.id,
                        issueNumber: newspaper.issueNumber,
                    };
                })
            );

            console.log(`[Cron] ${publishedNewspapers.length} journal(s) publié(s) avec succès`);
            return {
                success: true,
                publishedCount: publishedNewspapers.length,
                newspapers: publishedNewspapers,
            };
        } catch (error) {
            console.error("[Cron] Erreur lors de la publication automatique:", error);
            return {
                success: false,
                publishedCount: 0,
                newspapers: [],
            };
        }
    }
}

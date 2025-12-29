import { db } from "@/lib/db";
import {
    newspapers,
    newspapersCategories,
    categories,
    countries,
    uploads,
} from "@/db/app-schema";
import { organizations } from "@/db/auth-schema";
import { eq, desc, and, sql, like, or } from "drizzle-orm";
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
    // Get all published newspapers and magazines with relations (for public)
    static async getPublishedNewspapersAndMagazines() {
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
    // Get all published newspapers with relations (for public)
    static async getPublishedNewspapers() {
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
                    sql`JSON_EXTRACT(${organizations.metadata}, '$.isActive') = true`,
                    // Check if organization metadata contains type: "Journal"
                    sql`JSON_UNQUOTE(JSON_EXTRACT(${organizations.metadata}, '$.type')) = 'Journal'`
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

    // Get published newspapers with pagination (for infinite scroll)
    static async getPublishedNewspapersPaginated(
        options: { limit?: number; cursor?: number; type?: "Journal" | "Magazine"; search?: string } = {}
    ) {
        const { limit = 12, cursor = 0, type = "Journal", search } = options;

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
                    currency: countries.currency,
                },
            })
            .from(newspapers)
            .leftJoin(organizations, eq(newspapers.organizationId, organizations.id))
            .leftJoin(countries, eq(newspapers.countryId, countries.id))
            .where(
                and(
                    eq(newspapers.status, Status.PUBLISHED),
                    sql`JSON_EXTRACT(${organizations.metadata}, '$.isActive') = true`,
                    sql`JSON_UNQUOTE(JSON_EXTRACT(${organizations.metadata}, '$.type')) = ${type}`,
                    search ? or(
                        like(organizations.name, `%${search}%`),
                        like(newspapers.issueNumber, `%${search}%`)
                    ) : undefined
                )
            )
            .orderBy(desc(newspapers.publishDate))
            .limit(limit + 1)
            .offset(cursor);

        // Check if there are more items
        const hasMore = publishedNewspapers.length > limit;
        const dataSlice = hasMore ? publishedNewspapers.slice(0, limit) : publishedNewspapers;

        // Fetch categories for each newspaper
        const newspapersWithCategories = await Promise.all(
            dataSlice.map(async (newspaper) => {
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
            nextCursor: hasMore ? cursor + limit : undefined,
            total: newspapersWithCategories.length,
        };
    }

    // Get all published magazines with relations (for public)
    static async getPublishedMagazines() {
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
                    sql`JSON_EXTRACT(${organizations.metadata}, '$.isActive') = true`,
                    // Check if organization metadata contains type: "Journal"
                    sql`JSON_UNQUOTE(JSON_EXTRACT(${organizations.metadata}, '$.type')) = 'Magazine'`
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
                    description: organizations.description,
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

    // Get newspapers by organization ID (with pagination)
    static async getByOrganization(
        organizationId: string,
        options: { limit?: number; cursor?: number; excludeId?: string } = {}
    ) {
        const { limit = 6, cursor = 0, excludeId } = options;

        // Fetch one extra to determine if there are more items
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
                // Organization data for NewspaperCard
                organization: {
                    id: organizations.id,
                    name: organizations.name,
                    slug: organizations.slug,
                    logo: organizations.logo,
                },
                // Country data for NewspaperCard
                country: {
                    id: countries.id,
                    name: countries.name,
                    slug: countries.slug,
                    flag: countries.flag,
                    code: countries.code,
                    currency: countries.currency,
                },
            })
            .from(newspapers)
            .leftJoin(organizations, eq(newspapers.organizationId, organizations.id))
            .leftJoin(countries, eq(newspapers.countryId, countries.id))
            .where(
                excludeId
                    ? and(
                        eq(newspapers.organizationId, organizationId),
                        eq(newspapers.status, Status.PUBLISHED),
                        sql`${newspapers.id} != ${excludeId}`
                    )
                    : and(
                        eq(newspapers.organizationId, organizationId),
                        eq(newspapers.status, Status.PUBLISHED)
                    )
            )
            .orderBy(desc(newspapers.publishDate))
            .limit(limit + 1)
            .offset(cursor);

        // Check if there are more items
        const hasMore = orgNewspapers.length > limit;
        const data = hasMore ? orgNewspapers.slice(0, limit) : orgNewspapers;

        return {
            success: true,
            data,
            nextCursor: hasMore ? cursor + limit : undefined,
            total: data.length,
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
                    sql`JSON_EXTRACT(${organizations.metadata}, '$.isActive') = true`,
                    sql`JSON_EXTRACT(${organizations.metadata}, '$.type') = 'Journal'`
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

            // Lookup country ID by name
            let countryId: number | null = null;
            if (data.country) {
                const countryResult = await db
                    .select({ id: countries.id })
                    .from(countries)
                    .where(eq(countries.name, data.country))
                    .limit(1);

                if (countryResult.length > 0) {
                    countryId = countryResult[0].id;
                }
            }

            // 1. Process files first (Upload & Create Upload Records)
            let coverImageUrl = "";
            let coverImageUploadId: number | null = data.coverImageUploadId ?? null;

            // Magic: Extract ID from file object if already uploaded
            if (!coverImageUploadId && data.coverImageFile && data.coverImageFile.length > 0 && (data.coverImageFile[0] as any).id) {
                coverImageUploadId = (data.coverImageFile[0] as any).id;
            }

            let pdfUrl = "";
            let pdfUploadId: number | null = data.pdfUploadId ?? null;

            // Handle pre-uploaded cover image
            if (coverImageUploadId) {
                const upload = await UploadsController.getById(coverImageUploadId);
                if (upload.success && upload.data) {
                    // Use the thumbnail URL if available
                    coverImageUrl = upload.data.thumbnailUrl;
                }
            }
            // Fallback: Handle cover image upload via file
            else if (data.coverImageFile && data.coverImageFile.length > 0) {
                const coverFile = data.coverImageFile[0];

                if (coverFile instanceof File || (coverFile && typeof coverFile === 'object')) {
                    let fileToUpload: File | null = null;

                    if (coverFile instanceof File) {
                        fileToUpload = coverFile;
                    } else if ('base64' in coverFile && typeof (coverFile as any).base64 === 'string') {
                        // Handle Base64 wrapper (sent via JSON)
                        const base64Data = (coverFile as any).base64 as string;
                        const base64Content = base64Data.includes(';base64,')
                            ? base64Data.split(';base64,')[1]
                            : base64Data;

                        const buffer = Buffer.from(base64Content, 'base64');
                        const fileName = (coverFile as any).name || 'image.png';
                        const fileType = (coverFile as any).type || 'image/png';

                        fileToUpload = new File([buffer], fileName, { type: fileType });
                    } else if ('file' in coverFile) {
                        // Fallback: If received via FormData/special handling where 'file' is preserved
                        const innerFile = (coverFile as any).file as Blob;
                        const fileName = (coverFile as any).name || 'image.png';
                        const fileType = (coverFile as any).type || 'image/png';
                        fileToUpload = new File([innerFile], fileName, { type: fileType });
                    } else {
                        console.error("[Newspaper Create] Invalid cover file format");
                    }

                    if (fileToUpload) {
                        const uploadResult = await UploadsController.uploadImage(fileToUpload, {
                            maxWidth: 1200,
                            maxHeight: 1600,
                            quality: 85,
                            createThumbnail: true,
                        });

                        if (uploadResult.success && 'data' in uploadResult && uploadResult.data) {
                            coverImageUrl = uploadResult.data.url;

                            const uploadRecord = await db.insert(uploads).values({
                                filename: fileToUpload.name.replace(/\.[^/.]+$/, '.webp'),
                                thumbnailS3Key: uploadResult.data.s3Key,
                                thumbnailUrl: uploadResult.data.thumbnailUrl || uploadResult.data.url,
                            });
                            coverImageUploadId = uploadRecord[0].insertId;
                        }
                    }
                } else if (typeof coverFile === 'string') {
                    coverImageUrl = coverFile;
                }
            }

            // Handle pre-uploaded PDF
            // Handle pre-uploaded PDF
            // Magic: Extract ID from file object if already uploaded
            if (!pdfUploadId && data.pdfFile && data.pdfFile.length > 0 && (data.pdfFile[0] as any).id) {
                pdfUploadId = (data.pdfFile[0] as any).id;
            }

            if (pdfUploadId) {
                const upload = await UploadsController.getById(pdfUploadId);
                if (upload.success && upload.data) {
                    pdfUrl = upload.data.thumbnailUrl;
                }
            }
            // Fallback: Handle PDF upload via file
            else if (data.pdfFile && data.pdfFile.length > 0) {
                const pdfFile = data.pdfFile[0];

                if (pdfFile instanceof File || (pdfFile && typeof pdfFile === 'object')) {
                    let fileToUpload: File | null = null;

                    if (pdfFile instanceof File) {
                        fileToUpload = pdfFile;
                    } else if ('base64' in pdfFile && typeof (pdfFile as any).base64 === 'string') {
                        // Handle Base64 wrapper (sent via JSON)
                        const base64Data = (pdfFile as any).base64 as string;
                        const base64Content = base64Data.includes(';base64,')
                            ? base64Data.split(';base64,')[1]
                            : base64Data;

                        const buffer = Buffer.from(base64Content, 'base64');
                        const fileName = (pdfFile as any).name || 'document.pdf';
                        const fileType = (pdfFile as any).type || 'application/pdf';

                        fileToUpload = new File([buffer], fileName, { type: fileType });
                    } else if ('file' in pdfFile) {
                        const innerFile = (pdfFile as any).file as Blob;
                        const fileName = (pdfFile as any).name || 'document.pdf';
                        const fileType = (pdfFile as any).type || 'application/pdf';
                        fileToUpload = new File([innerFile], fileName, { type: fileType });
                    } else {
                        console.error("[Newspaper Create] Invalid PDF file format");
                    }

                    if (fileToUpload) {
                        const uploadResult = await UploadsController.uploadPdf(fileToUpload);

                        if (uploadResult.success && 'data' in uploadResult && uploadResult.data) {
                            pdfUrl = uploadResult.data.url;

                            const uploadRecord = await db.insert(uploads).values({
                                filename: fileToUpload.name,
                                thumbnailS3Key: uploadResult.data.s3Key,
                                thumbnailUrl: uploadResult.data.url,
                            });
                            pdfUploadId = uploadRecord[0].insertId;
                        }
                    }
                } else if (typeof pdfFile === 'string') {
                    pdfUrl = pdfFile;
                }
            }

            // 2. Insert the newspaper record with all data
            await db.insert(newspapers).values({
                id: newspaperId,
                issueNumber: data.issueNumber,
                publishDate: new Date(data.publishDate),
                coverImage: coverImageUrl,
                price: data.price.toString(),
                pdf: pdfUrl,
                status: data.status,
                organizationId: data.organizationId,
                countryId: countryId,
                coverImageUploadId: coverImageUploadId,
                pdfUploadId: pdfUploadId,
            });

            // 3. Insert category associations
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
            if (data.country) {
                // Lookup country ID by name
                const countryResult = await db
                    .select({ id: countries.id })
                    .from(countries)
                    .where(eq(countries.name, data.country))
                    .limit(1);

                if (countryResult.length > 0) {
                    updateData.countryId = countryResult[0].id;
                }
            }
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

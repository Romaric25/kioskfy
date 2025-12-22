import { db } from "@/lib/db";
import { uploads } from "@/db/app-schema";
import { eq, desc } from "drizzle-orm";
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, r2BucketName } from "@/lib/r2";
import {
    createUploadSchema,
    updateUploadSchema,
    type CreateUpload,
    type UpdateUpload,
} from "@/server/models/upload.model";

export class UploadsController {
    /**
     * Get all uploads
     */
    static async getAll() {
        const allUploads = await db
            .select()
            .from(uploads)
            .orderBy(desc(uploads.createdAt));

        return {
            success: true,
            data: allUploads,
        };
    }

    /**
     * Get upload by ID
     */
    static async getById(id: number) {
        const upload = await db
            .select()
            .from(uploads)
            .where(eq(uploads.id, id))
            .limit(1);

        if (upload.length === 0) {
            return {
                success: false,
                status: 404,
                error: "Fichier non trouvé",
            };
        }

        return {
            success: true,
            data: upload[0],
        };
    }

    /**
     * Create a new upload record
     */
    static async create(body: unknown) {
        const validation = createUploadSchema.safeParse(body);
        if (!validation.success) {
            return {
                success: false,
                status: 400,
                error: "Données invalides",
                details: validation.error.flatten().fieldErrors,
            };
        }

        const data: CreateUpload = validation.data;

        try {
            const result = await db.insert(uploads).values({
                filename: data.filename,
                thumbnailS3Key: data.thumbnailS3Key,
                thumbnailUrl: data.thumbnailUrl,
            });

            return {
                success: true,
                status: 201,
                data: { id: result[0].insertId },
                message: "Fichier enregistré avec succès",
            };
        } catch (error) {
            return {
                success: false,
                status: 400,
                error: "Erreur lors de l'enregistrement du fichier",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            };
        }
    }

    /**
     * Update an upload record
     */
    static async update(id: number, body: unknown) {
        const validation = updateUploadSchema.safeParse(body);
        if (!validation.success) {
            return {
                success: false,
                status: 400,
                error: "Données invalides",
                details: validation.error.flatten().fieldErrors,
            };
        }

        const data: UpdateUpload = validation.data;

        try {
            const existing = await db
                .select()
                .from(uploads)
                .where(eq(uploads.id, id))
                .limit(1);

            if (existing.length === 0) {
                return {
                    success: false,
                    status: 404,
                    error: "Fichier non trouvé",
                };
            }

            await db.update(uploads).set(data).where(eq(uploads.id, id));

            return {
                success: true,
                message: "Fichier mis à jour avec succès",
            };
        } catch (error) {
            return {
                success: false,
                status: 400,
                error: "Erreur lors de la mise à jour du fichier",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            };
        }
    }

    /**
     * Delete an upload record and file from S3
     */
    static async delete(id: number) {
        try {
            const existing = await db
                .select()
                .from(uploads)
                .where(eq(uploads.id, id))
                .limit(1);

            if (existing.length === 0) {
                return {
                    success: false,
                    status: 404,
                    error: "Fichier non trouvé",
                };
            }

            // Delete from S3
            const deleteCommand = new DeleteObjectCommand({
                Bucket: r2BucketName,
                Key: existing[0].thumbnailS3Key,
            });
            await r2Client.send(deleteCommand);

            // Delete from database
            await db.delete(uploads).where(eq(uploads.id, id));

            return {
                success: true,
                message: "Fichier supprimé avec succès",
            };
        } catch (error) {
            return {
                success: false,
                status: 400,
                error: "Erreur lors de la suppression du fichier",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            };
        }
    }

    /**
     * Get a file stream from R2/S3
     */
    static async getFileStreamFromR2(s3Key: string): Promise<ReadableStream<Uint8Array>> {
        const command = new GetObjectCommand({
            Bucket: r2BucketName,
            Key: s3Key,
        });

        const response = await r2Client.send(command);

        console.log(`[UploadsController] Stream retrieved for ${s3Key}, ContentLength: ${response.ContentLength}`);

        if (!response.Body) {
            throw new Error("Empty response body from R2");
        }

        return response.Body.transformToWebStream();
    }

    /**
     * Get file metadata from R2/S3
     */
    static async getFileMetadata(s3Key: string) {
        const command = new GetObjectCommand({
            Bucket: r2BucketName,
            Key: s3Key,
        });

        const response = await r2Client.send(command);

        return {
            contentType: response.ContentType,
            contentLength: response.ContentLength,
        };
    }

    /**
     * Upload a file directly to R2
     * For images: processes with Sharp (resize, WebP conversion, thumbnail)
     * For other files: uploads as-is
     */
    static async uploadFile(file: File, options?: {
        processImage?: boolean;
        createThumbnail?: boolean;
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
    }) {
        try {
            const {
                processImage = true,
                createThumbnail = true,
                maxWidth = 1920,
                maxHeight = 1080,
                quality = 85,
            } = options || {};

            const isImage = file.type.startsWith('image/');
            const timestamp = Date.now();
            const baseName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension

            // If it's an image and processing is enabled
            if (isImage && processImage) {
                const { imageProcessor } = await import('@/server/services/image-processor.service');

                const inputBuffer = await imageProcessor.fileToBuffer(file);

                // Validate image
                const isValid = await imageProcessor.validateImage(inputBuffer);
                if (!isValid) {
                    return {
                        success: false,
                        error: "Le fichier n'est pas une image valide"
                    };
                }

                // Process image
                const processed = await imageProcessor.processImage(inputBuffer, {
                    maxWidth,
                    maxHeight,
                    quality,
                    createThumbnail,
                });

                // Upload main image (WebP)
                const mainS3Key = `uploads/${timestamp}-${baseName}.webp`;
                const mainCommand = new PutObjectCommand({
                    Bucket: r2BucketName,
                    Key: mainS3Key,
                    Body: new Uint8Array(processed.buffer),
                    ContentType: 'image/webp',
                });
                await r2Client.send(mainCommand);

                const mainUrl = `${process.env.R2_PUBLIC_URL}/${mainS3Key}`;
                let thumbnailS3Key: string | undefined;
                let thumbnailUrl: string | undefined;

                // Upload thumbnail if created
                if (processed.thumbnail) {
                    thumbnailS3Key = `uploads/thumbnails/${timestamp}-${baseName}-thumb.webp`;
                    const thumbCommand = new PutObjectCommand({
                        Bucket: r2BucketName,
                        Key: thumbnailS3Key,
                        Body: new Uint8Array(processed.thumbnail.buffer),
                        ContentType: 'image/webp',
                    });
                    await r2Client.send(thumbCommand);
                    thumbnailUrl = `${process.env.R2_PUBLIC_URL}/${thumbnailS3Key}`;
                }

                console.log(`[Upload] Image traitée et uploadée: ${mainS3Key}`);

                return {
                    success: true,
                    data: {
                        s3Key: mainS3Key,
                        url: mainUrl,
                        thumbnailS3Key,
                        thumbnailUrl,
                        width: processed.width,
                        height: processed.height,
                        format: processed.format,
                        size: processed.size,
                    }
                };
            }

            // For non-images (PDF, etc.) or when processing is disabled: upload as-is
            const buffer = await file.arrayBuffer();
            const s3Key = `uploads/${timestamp}-${file.name}`;

            const command = new PutObjectCommand({
                Bucket: r2BucketName,
                Key: s3Key,
                Body: new Uint8Array(buffer),
                ContentType: file.type,
            });

            await r2Client.send(command);

            console.log(`[Upload] Fichier uploadé: ${s3Key}`);

            return {
                success: true,
                data: {
                    s3Key,
                    url: `${process.env.R2_PUBLIC_URL}/${s3Key}`
                }
            };
        } catch (error) {
            console.error("Error uploading file to R2:", error);
            return {
                success: false,
                error: "Erreur lors de l'upload vers R2"
            };
        }
    }

    /**
     * Upload an image with processing (convenience method)
     */
    static async uploadImage(file: File, options?: {
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
        createThumbnail?: boolean;
    }) {
        return this.uploadFile(file, {
            processImage: true,
            ...options,
        });
    }

    /**
     * Upload a PDF file (no processing)
     */
    static async uploadPdf(file: File) {
        if (file.type !== 'application/pdf') {
            return {
                success: false,
                error: "Le fichier doit être un PDF"
            };
        }
        return this.uploadFile(file, { processImage: false });
    }

    /**
     * Generate a presigned URL for file upload
     */
    static async getPresignedUploadUrl(filename: string, contentType: string) {
        const s3Key = `uploads/${Date.now()}-${filename}`;

        const command = new PutObjectCommand({
            Bucket: r2BucketName,
            Key: s3Key,
            ContentType: contentType,
        });

        const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

        return {
            success: true,
            data: {
                presignedUrl,
                s3Key,
                expiresIn: 3600,
            },
        };
    }

    /**
     * Generate a presigned URL for file download
     */
    static async getPresignedDownloadUrl(s3Key: string) {
        const command = new GetObjectCommand({
            Bucket: r2BucketName,
            Key: s3Key,
        });

        const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

        return {
            success: true,
            data: {
                presignedUrl,
                expiresIn: 3600,
            },
        };
    }
}

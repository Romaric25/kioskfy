import sharp from 'sharp';

export interface ImageProcessingOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    createThumbnail?: boolean;
    thumbnailSize?: number;
}

export interface ProcessedImage {
    buffer: Buffer;
    width: number;
    height: number;
    format: string;
    size: number;
}

export interface ProcessedImageWithThumbnail extends ProcessedImage {
    thumbnail?: {
        buffer: Buffer;
        width: number;
        height: number;
        size: number;
    };
}

/**
 * Service de traitement d'images avec Sharp
 * Adapté pour Elysia/Bun (sans dépendances NestJS)
 */
export class ImageProcessorService {
    private static instance: ImageProcessorService;

    private constructor() { }

    /**
     * Singleton pattern pour réutiliser l'instance
     */
    static getInstance(): ImageProcessorService {
        if (!ImageProcessorService.instance) {
            ImageProcessorService.instance = new ImageProcessorService();
        }
        return ImageProcessorService.instance;
    }

    /**
     * Traite une image avec redimensionnement et conversion en WebP
     */
    async processImage(
        inputBuffer: Buffer,
        options: ImageProcessingOptions = {},
    ): Promise<ProcessedImageWithThumbnail> {
        try {
            const {
                maxWidth = 1920,
                maxHeight = 1080,
                quality = 85,
                createThumbnail = true,
                thumbnailSize = 300,
            } = options;

            // Obtenir les métadonnées de l'image originale
            const metadata = await sharp(inputBuffer).metadata();
            console.log(
                `[ImageProcessor] Image originale: ${metadata.width}x${metadata.height}, format: ${metadata.format}`,
            );

            // Redimensionner l'image principale
            const sharpInstance = sharp(inputBuffer).resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true,
            });

            // Convertir en WebP
            const processedImage = await sharpInstance
                .webp({ quality })
                .toBuffer({ resolveWithObject: true });

            const result: ProcessedImageWithThumbnail = {
                buffer: processedImage.data,
                width: processedImage.info.width,
                height: processedImage.info.height,
                format: 'webp',
                size: processedImage.data.length,
            };

            // Créer une miniature si demandé
            if (createThumbnail) {
                const thumbnailInstance = sharp(inputBuffer).resize(
                    thumbnailSize,
                    thumbnailSize,
                    {
                        fit: 'cover',
                        position: 'center',
                    },
                );

                // Convertir la miniature en WebP
                const thumbnail = await thumbnailInstance
                    .webp({ quality: 80 })
                    .toBuffer({ resolveWithObject: true });

                result.thumbnail = {
                    buffer: thumbnail.data,
                    width: thumbnail.info.width,
                    height: thumbnail.info.height,
                    size: thumbnail.data.length,
                };

                console.log(
                    `[ImageProcessor] Miniature créée: ${thumbnail.info.width}x${thumbnail.info.height}, taille: ${thumbnail.data.length} bytes`,
                );
            }

            console.log(
                `[ImageProcessor] Image traitée: ${result.width}x${result.height}, format: ${result.format}, taille: ${result.size} bytes`,
            );

            return result;
        } catch (error) {
            console.error("[ImageProcessor] Erreur lors du traitement de l'image:", error);
            throw new Error("Impossible de traiter l'image");
        }
    }

    /**
     * Valide si le buffer est une image valide
     */
    async validateImage(buffer: Buffer): Promise<boolean> {
        try {
            const metadata = await sharp(buffer).metadata();
            return !!(metadata.width && metadata.height);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('[ImageProcessor] Buffer invalide pour une image:', message);
            return false;
        }
    }

    /**
     * Obtient les métadonnées d'une image
     */
    async getImageMetadata(buffer: Buffer) {
        try {
            return await sharp(buffer).metadata();
        } catch (error) {
            console.error('[ImageProcessor] Erreur lors de la lecture des métadonnées:', error);
            throw new Error("Impossible de lire les métadonnées de l'image");
        }
    }

    /**
     * Optimise une image existante
     */
    async optimizeImage(
        inputBuffer: Buffer,
        quality: number = 85,
    ): Promise<Buffer> {
        try {
            return await sharp(inputBuffer).webp({ quality }).toBuffer();
        } catch (error) {
            console.error("[ImageProcessor] Erreur lors de l'optimisation de l'image:", error);
            throw new Error("Impossible d'optimiser l'image");
        }
    }

    /**
     * Convertit un File en Buffer
     */
    async fileToBuffer(file: File): Promise<Buffer> {
        const arrayBuffer = await file.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    /**
     * Vérifie si le fichier est une image
     */
    isImageFile(file: File): boolean {
        return file.type.startsWith('image/');
    }

    /**
     * Vérifie si le fichier est un PDF
     */
    isPdfFile(file: File): boolean {
        return file.type === 'application/pdf';
    }
}

// Export singleton instance
export const imageProcessor = ImageProcessorService.getInstance();

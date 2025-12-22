import { db } from "@/lib/db";
import { organizations } from "@/db/auth-schema";
import { uploads } from "@/db/app-schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { UploadsController } from "./uploads.controller";
import type { CreateOrganization, UpdateOrganization } from "../models/organization.model";

/**
 * Interface pour la création d'une organisation
 * Étend le type du modèle en excluant le logo (géré par fichier) et le slug (géré car optionnel/généré)
 */
interface CreateOrganizationInput extends Omit<CreateOrganization, "logo" | "slug"> {
    slug?: string;
    price?: number;
    logoFile?: File;
}

/**
 * Interface pour la mise à jour d'une organisation
 * Étend le type du modèle en excluant l'ID (passé en param) et le logo
 */
interface UpdateOrganizationInput extends Omit<UpdateOrganization, "id" | "logo"> {
    logoFile?: File;
}

/**
 * Controller pour les opérations sur les organisations
 * Utilise better-auth pour la gestion des organisations avec support de l'upload de logo
 */
export class OrganizationsController {
    /**
     * Upload un fichier logo vers R2 et crée l'enregistrement
     * @returns { logoUrl, logoUploadId } si réussi, null si pas de fichier
     */
    private static async uploadLogo(logoFile: File): Promise<{ logoUrl: string; logoUploadId: number } | null> {
        try {
            // Step 1: Upload directly to R2
            const uploadResult = await UploadsController.uploadFile(logoFile);

            if (!uploadResult.success || !uploadResult.data) {
                throw new Error("Failed to upload file to R2");
            }

            const { s3Key, url } = uploadResult.data;

            // Step 2: Create upload record
            const uploadRecord = await UploadsController.create({
                filename: logoFile.name,
                thumbnailS3Key: s3Key,
                thumbnailUrl: url,
            });

            if (!uploadRecord.success || !("data" in uploadRecord)) {
                throw new Error("Failed to create upload record");
            }

            return {
                logoUrl: url,
                logoUploadId: (uploadRecord.data as { id: number }).id,
            };
        } catch (error) {
            console.error("Error uploading logo:", error);
            return null;
        }
    }

    /**
     * Créer une organisation avec gestion du logo
     * Utilise better-auth pour créer l'organisation
     */
    static async create(input: CreateOrganizationInput, userId: string) {
        try {
            let logoUrl: string | undefined;
            let logoUploadId: number | undefined = input.logoUploadId;

            // Upload logo if provided
            if (input.logoFile) {
                const uploadResult = await this.uploadLogo(input.logoFile);
                if (uploadResult) {
                    logoUrl = uploadResult.logoUrl;
                    logoUploadId = uploadResult.logoUploadId;
                }
            }

            // Generate slug if not provided
            const slug = input.slug || input.name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")
                .substring(0, 50);

            // Create organization using better-auth API
            const result = await auth.api.createOrganization({
                body: {
                    name: input.name,
                    slug,
                    logo: logoUrl,
                    logoUploadId,
                    metadata: {
                        ...input.metadata,
                    },
                    // Additional fields configured in better-auth
                    email: input.email,
                    phone: input.phone,
                    country: input.country,
                    address: input.address,
                    description: input.description,
                    price: input.price,
                },
                headers: new Headers(),
                query: {
                    userId,
                },
            });

            if (!result) {
                return {
                    success: false,
                    status: 400,
                    error: "Échec de la création de l'organisation",
                };
            }

            return {
                success: true,
                status: 201,
                data: result,
                message: "Organisation créée avec succès",
            };
        } catch (error) {
            console.error("Error creating organization:", error);
            return {
                success: false,
                status: 500,
                error: "Erreur lors de la création de l'organisation",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            };
        }
    }

    /**
     * Mettre à jour une organisation avec gestion du logo
     */
    static async update(organizationId: string, input: UpdateOrganizationInput) {
        try {
            // Get current organization
            const existing = await db
                .select()
                .from(organizations)
                .where(eq(organizations.id, organizationId))
                .limit(1);

            if (existing.length === 0) {
                return {
                    success: false,
                    status: 404,
                    error: "Organisation non trouvée",
                };
            }

            const currentOrg = existing[0];
            let logoUrl = currentOrg.logo;
            let logoUploadId = currentOrg.logoUploadId;

            // Handle logo upload if new file provided
            if (input.logoFile) {
                // Delete old logo if exists
                if (currentOrg.logoUploadId) {
                    await UploadsController.delete(currentOrg.logoUploadId);
                }

                // Upload new logo
                const uploadResult = await this.uploadLogo(input.logoFile);
                if (uploadResult) {
                    logoUrl = uploadResult.logoUrl;
                    logoUploadId = uploadResult.logoUploadId;
                }
            } else if (input.logoUploadId !== undefined) {
                // Handle explicit logoUploadId update without file
                logoUploadId = input.logoUploadId;
                // Note: We might want to fetch the URL for this uploadId to keep 'logo' field in sync,
                // but for now we assume the client might not expect that side effect or handles it.
                // However, better-auth organization table has 'logo' column.
            }

            // Parse existing metadata
            let existingMetadata: Record<string, unknown> = {};
            if (currentOrg.metadata) {
                try {
                    existingMetadata = typeof currentOrg.metadata === "string"
                        ? JSON.parse(currentOrg.metadata)
                        : currentOrg.metadata;
                } catch {
                    existingMetadata = {};
                }
            }

            // Merge metadata
            const mergedMetadata = {
                ...existingMetadata,
                ...input.metadata,
                logoUploadId,
            };

            // Update organization using better-auth API
            const result = await auth.api.updateOrganization({
                body: {
                    organizationId,
                    data: {
                        name: input.name,
                        logo: logoUrl || undefined,
                        metadata: mergedMetadata,
                        // Additional fields
                        email: input.email,
                        phone: input.phone,
                        country: input.country,
                        address: input.address,
                        description: input.description,
                        price: input.price,
                    },
                },
                headers: new Headers(),
            });

            if (!result) {
                return {
                    success: false,
                    status: 400,
                    error: "Échec de la mise à jour de l'organisation",
                };
            }

            return {
                success: true,
                data: result,
                message: "Organisation mise à jour avec succès",
            };
        } catch (error) {
            console.error("Error updating organization:", error);
            return {
                success: false,
                status: 500,
                error: "Erreur lors de la mise à jour de l'organisation",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            };
        }
    }

    /**
     * Récupérer une organisation par ID avec les détails du logo
     */
    static async getById(organizationId: string) {
        try {
            const organization = await db
                .select({
                    id: organizations.id,
                    name: organizations.name,
                    slug: organizations.slug,
                    email: organizations.email,
                    phone: organizations.phone,
                    country: organizations.country,
                    address: organizations.address,
                    description: organizations.description,
                    price: organizations.price,
                    logo: organizations.logo,
                    logoUploadId: organizations.logoUploadId,
                    metadata: organizations.metadata,
                    createdAt: organizations.createdAt,
                    updatedAt: organizations.updatedAt,
                    logoUpload: {
                        id: uploads.id,
                        filename: uploads.filename,
                        thumbnailUrl: uploads.thumbnailUrl,
                    },
                })
                .from(organizations)
                .leftJoin(uploads, eq(organizations.logoUploadId, uploads.id))
                .where(eq(organizations.id, organizationId))
                .limit(1);

            if (organization.length === 0) {
                return {
                    success: false,
                    status: 404,
                    error: "Organisation non trouvée",
                };
            }

            // Parse metadata
            const org = organization[0];
            let parsedMetadata: Record<string, unknown> | null = null;
            if (org.metadata) {
                try {
                    parsedMetadata = typeof org.metadata === "string"
                        ? JSON.parse(org.metadata)
                        : org.metadata;
                } catch {
                    parsedMetadata = null;
                }
            }

            return {
                success: true,
                data: {
                    ...org,
                    metadata: parsedMetadata,
                },
            };
        } catch (error) {
            console.error("Error fetching organization:", error);
            return {
                success: false,
                status: 500,
                error: "Erreur lors de la récupération de l'organisation",
            };
        }
    }

    /**
     * Supprimer une organisation et son logo associé
     */
    static async delete(organizationId: string) {
        try {
            const existing = await db
                .select()
                .from(organizations)
                .where(eq(organizations.id, organizationId))
                .limit(1);

            if (existing.length === 0) {
                return {
                    success: false,
                    status: 404,
                    error: "Organisation non trouvée",
                };
            }

            // Delete logo if exists
            if (existing[0].logoUploadId) {
                await UploadsController.delete(existing[0].logoUploadId);
            }

            // Delete organization using better-auth API
            const result = await auth.api.deleteOrganization({
                body: {
                    organizationId,
                },
                headers: new Headers(),
            });

            if (!result) {
                return {
                    success: false,
                    status: 400,
                    error: "Échec de la suppression de l'organisation",
                };
            }

            return {
                success: true,
                message: "Organisation supprimée avec succès",
            };
        } catch (error) {
            console.error("Error deleting organization:", error);
            return {
                success: false,
                status: 500,
                error: "Erreur lors de la suppression de l'organisation",
            };
        }
    }

    /**
     * Lister toutes les organisations d'un utilisateur
     */
    static async listByUser(userId: string) {
        try {
            const result = await auth.api.listOrganizations({
                headers: new Headers(),
                query: {
                    userId,
                },
            });

            return {
                success: true,
                data: result,
            };
        } catch (error) {
            console.error("Error listing organizations:", error);
            return {
                success: false,
                status: 500,
                error: "Erreur lors de la récupération des organisations",
            };
        }
    }

    /**
     * Récupérer l'organisation active complète
     */
    static async getFullOrganization(organizationId: string) {
        try {
            const result = await auth.api.getFullOrganization({
                headers: new Headers(),
                query: {
                    organizationId,
                },
            });

            if (!result) {
                return {
                    success: false,
                    status: 404,
                    error: "Organisation non trouvée",
                };
            }

            return {
                success: true,
                data: result,
            };
        } catch (error) {
            console.error("Error fetching full organization:", error);
            return {
                success: false,
                status: 500,
                error: "Erreur lors de la récupération de l'organisation",
            };
        }
    }

    /**
     * Lister toutes les organisations avec leurs logos
     */
    static async listAll() {
        try {
            const result = await db
                .select({
                    id: organizations.id,
                    name: organizations.name,
                    slug: organizations.slug,
                    email: organizations.email,
                    phone: organizations.phone,
                    country: organizations.country,
                    address: organizations.address,
                    description: organizations.description,
                    price: organizations.price,
                    logo: organizations.logo,
                    logoUploadId: organizations.logoUploadId,
                    metadata: organizations.metadata,
                    createdAt: organizations.createdAt,
                    updatedAt: organizations.updatedAt,
                    logoUpload: {
                        id: uploads.id,
                        filename: uploads.filename,
                        thumbnailUrl: uploads.thumbnailUrl,
                    },
                })
                .from(organizations)
                .leftJoin(uploads, eq(organizations.logoUploadId, uploads.id));

            return {
                success: true,
                data: result,
            };
        } catch (error) {
            console.error("Error listing all organizations:", error);
            return {
                success: false,
                status: 500,
                error: "Erreur lors de la récupération des organisations",
            };
        }
    }
}

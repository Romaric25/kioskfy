import { Elysia, t } from "elysia";
import { UploadsController } from "@/server/controllers/uploads.controller";

export const uploadsService = new Elysia({ prefix: "/uploads" })
    // Get all uploads
    .get(
        "/",
        async () => {
            return await UploadsController.getAll();
        },
        {
            detail: {
                tags: ["Admin"],
                summary: "Récupérer tous les fichiers",
                description: "Retourne tous les fichiers uploadés",
            },
        }
    )
    // Get upload by ID
    .get(
        "/:id",
        async ({ params: { id }, set }) => {
            const result = await UploadsController.getById(id);
            if (!result.success && "status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            params: t.Object({
                id: t.Numeric(),
            }),
            detail: {
                tags: ["Admin"],
                summary: "Récupérer un fichier par ID",
                description: "Retourne les détails d'un fichier spécifique",
            },
        }
    )
    // Create upload record
    .post(
        "/",
        async ({ body, set }) => {
            const result = await UploadsController.create(body);
            if ("status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            body: t.Object({
                filename: t.String({ minLength: 1 }),
                thumbnailS3Key: t.String({ minLength: 1 }),
                thumbnailUrl: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Admin"],
                summary: "Créer un enregistrement de fichier",
                description: "Enregistre les métadonnées d'un fichier uploadé",
            },
        }
    )
    // Update upload record
    .put(
        "/:id",
        async ({ params: { id }, body, set }) => {
            const result = await UploadsController.update(id, body);
            if (!result.success && "status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            params: t.Object({
                id: t.Numeric(),
            }),
            body: t.Partial(
                t.Object({
                    filename: t.String({ minLength: 1 }),
                    thumbnailS3Key: t.String({ minLength: 1 }),
                    thumbnailUrl: t.String({ minLength: 1 }),
                })
            ),
            detail: {
                tags: ["Admin"],
                summary: "Mettre à jour un fichier",
                description: "Met à jour les métadonnées d'un fichier",
            },
        }
    )
    // Delete upload
    .delete(
        "/:id",
        async ({ params: { id }, set }) => {
            const result = await UploadsController.delete(id);
            if (!result.success && "status" in result) {
                set.status = result.status;
            }
            return result;
        },
        {
            params: t.Object({
                id: t.Numeric(),
            }),
            detail: {
                tags: ["Admin"],
                summary: "Supprimer un fichier",
                description: "Supprime un fichier de R2 et de la base de données",
            },
        }
    )
    // Get presigned URL for upload
    .post(
        "/presigned-upload",
        async ({ body }) => {
            return await UploadsController.getPresignedUploadUrl(
                body.filename,
                body.contentType
            );
        },
        {
            body: t.Object({
                filename: t.String({ minLength: 1 }),
                contentType: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Admin"],
                summary: "Obtenir une URL présignée pour upload",
                description: "Génère une URL présignée pour uploader un fichier directement vers R2",
            },
        }
    )
    // Get presigned URL for download
    .post(
        "/presigned-download",
        async ({ body }) => {
            return await UploadsController.getPresignedDownloadUrl(body.s3Key);
        },
        {
            body: t.Object({
                s3Key: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Admin"],
                summary: "Obtenir une URL présignée pour téléchargement",
                description: "Génère une URL présignée pour télécharger un fichier depuis R2",
            },
        }
    )
    // Stream file from R2
    .get(
        "/stream/:s3Key",
        async ({ params: { s3Key }, set }) => {
            try {
                const stream = await UploadsController.getFileStreamFromR2(decodeURIComponent(s3Key));
                const metadata = await UploadsController.getFileMetadata(decodeURIComponent(s3Key));

                set.headers["Content-Type"] = metadata.contentType || "application/octet-stream";
                set.headers["Content-Disposition"] = "inline";

                return stream;
            } catch (error) {
                set.status = 404;
                return { error: "Fichier non trouvé" };
            }
        },
        {
            params: t.Object({
                s3Key: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ["Public"],
                summary: "Stream un fichier depuis R2",
                description: "Récupère et stream un fichier directement depuis R2",
            },
        }
    );

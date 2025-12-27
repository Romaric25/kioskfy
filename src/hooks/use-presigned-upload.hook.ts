import { useState } from "react";
import { toast } from "react-hot-toast";
import { client } from "@/lib/client";

interface PresignedUploadResult {
    id: number;
    s3Key: string;
    url: string;
    filename: string;
    thumbnailS3Key?: string;
    thumbnailUrl?: string;
}

export const usePresignedUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const uploadFile = async (file: File, folder = "uploads"): Promise<PresignedUploadResult | null> => {
        setIsUploading(true);
        setProgress(0);
        try {
            // 1. Get Presigned URL
            const initRes = await client.api.v1.uploads["presigned-upload"].post({
                filename: file.name,
                contentType: file.type,
                folder
            });

            if (initRes.error) {
                const errorVal = initRes.error.value as any;
                throw new Error(errorVal.message || errorVal.error || "Erreur lors de l'initialisation de l'upload");
            }

            const initData = initRes.data;
            if (!(initData as any).success) throw new Error((initData as any).error || "Erreur inconnue");

            // @ts-ignore
            const { presignedUrl, s3Key, filename, publicUrl } = (initData as any).data;

            // 2. Upload to S3 (Direct fetch is correct here as it's external URL)
            const uploadRes = await fetch(presignedUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type }
            });

            if (!uploadRes.ok) throw new Error("Erreur lors de l'upload vers le stockage");

            // 3. Confirm upload
            const confirmRes = await client.api.v1.uploads.confirm.post({
                s3Key,
                filename,
                contentType: file.type,
                size: file.size
            });

            if (confirmRes.error) {
                const errorVal = confirmRes.error.value as any;
                throw new Error(errorVal.message || errorVal.error || "Erreur lors de la confirmation");
            }

            const confirmData = confirmRes.data;

            if (!(confirmData as any).success) throw new Error((confirmData as any).error);

            const resultData = (confirmData as any).data;

            return {
                id: resultData.id,
                s3Key,
                url: publicUrl,
                filename,
                thumbnailS3Key: resultData.thumbnailS3Key,
                thumbnailUrl: resultData.thumbnailUrl
            };

        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error instanceof Error ? error.message : "Erreur lors de l'upload");
            return null;
        } finally {
            setIsUploading(false);
            setProgress(0);
        }
    };

    return { uploadFile, isUploading, progress };
};

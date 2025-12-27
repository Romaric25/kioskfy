
import { PutBucketCorsCommand } from "@aws-sdk/client-s3";
import { r2Client, r2BucketName } from "@/lib/r2";

// Configuration CORS simplifiée pour R2
const corsConfiguration = {
    CORSRules: [
        {
            AllowedOrigins: ["*"],
            AllowedMethods: ["PUT", "GET", "POST", "HEAD", "DELETE"],
            AllowedHeaders: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3600
        }
    ]
};

async function setupCors() {
    if (!r2BucketName) {
        console.error("❌ R2_BUCKET_NAME n'est pas défini dans les variables d'environnement.");
        return;
    }

    console.log(`🔧 Configuration CORS pour le bucket : ${r2BucketName}...`);

    try {
        const command = new PutBucketCorsCommand({
            Bucket: r2BucketName,
            CORSConfiguration: corsConfiguration,
        });

        await r2Client.send(command);
        console.log("✅ Configuration CORS appliquée avec succès !");
        console.log("Les origines suivantes sont autorisées :", corsConfiguration.CORSRules[0].AllowedOrigins);
    } catch (error) {
        console.error("❌ Erreur lors de la configuration CORS :", error);
    }
}

setupCors();

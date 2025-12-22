import { Suspense } from "react";
import { EmailVerification } from "@/components/labo/email-verification";

export default function VerifyMail() {
    return (
        <div className="min-h-screen bg-muted/20 flex items-center justify-center">
            <Suspense fallback={<div>Chargement...</div>}>
                <EmailVerification />
            </Suspense>
        </div>
    );
}   
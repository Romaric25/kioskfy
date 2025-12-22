"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  Mail,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";


import toast from "react-hot-toast";
import { useVerifyEmail } from "@/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResendToken } from "@/hooks";
interface EmailVerificationProps {
  className?: string;
}

export function EmailVerification({ className }: EmailVerificationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isUpdatingUserActive, setIsUpdatingUserActive] =
    useState<boolean>(false);


  const { verifyEmail, isVerifyingEmail, isVerifyingEmailSuccess } =
    useVerifyEmail();
  const { resendToken, isResendingToken, isResendingTokenSuccess } =
    useResendToken();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [isResendDialogOpen, setIsResendDialogOpen] = useState<boolean>(false);
  const [resendEmail, setResendEmail] = useState<string>("");
  const token = searchParams.get("token");

  const handleVerification = useCallback(async () => {
    if (!token) {
      setErrorMessage("Aucun jeton de vérification fourni.");
      return;
    }
    try {
      const response = await verifyEmail(token);
      console.log("Data verifying email:", response);

      // Treaty client returns { data, error } structure
      if (response.error) {
        setIsError(true);
        setErrorMessage("Erreur de vérification.");
        return;
      }

      // Access the actual response data
      if (!response.data?.success) {
        setIsError(true);
        setErrorMessage("Erreur de vérification.");
      } else {
        setIsUpdatingUserActive(true);
      }
    } catch (error) {
      setIsError(true);
      setErrorMessage("Une erreur inattendue s'est produite.");
    }
  }, [token, verifyEmail]);

  const handleResendVerificationEmail = async () => {
    if (!resendEmail) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }

    try {
      await resendToken(resendEmail);
      toast.success("Email de vérification envoyé avec succès !");
      setIsResendDialogOpen(false);
      setResendEmail("");
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'email de vérification");
      console.error("Resend error:", error);
    }
  };

  useEffect(() => {
    if (token) {
      handleVerification();
    }
  }, [token, handleVerification]);

  const handleGoToLogin = () => {
    router.push("/");
  };

  const renderContent = () => {
    if (isVerifyingEmail) {
      return (
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">
            Vérification en cours...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Nous vérifions votre email, veuillez patienter.
          </p>
        </div>
      );
    }
    if (isError) {
      return (
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">
            Erreur de vérification
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {errorMessage}
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => setIsResendDialogOpen(true)}
              className="w-full"
            >
              Renvoyer un nouveau lien
            </Button>
          </div>
        </div>
      );
    }

    if (isVerifyingEmailSuccess || isUpdatingUserActive) {
      return (
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">
            Email vérifié avec succès !
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter.
          </p>
          <div className="space-y-3">
            <Button onClick={handleGoToLogin} className="w-full">
              Se connecter
            </Button>
          </div>
        </div>
      );
    }

    if (!token) {
      return (
        <div className="text-center">
          <Mail className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">
            Jeton manquant
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Aucun jeton de vérification n'a été fourni dans l'URL.
          </p>
          <div className="space-y-3">
            <Button
              onClick={handleGoToLogin}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              Annuler la vérification
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl p-8">
        {renderContent()}

        {isResendingTokenSuccess && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-400 text-center">
              ✅ Email de vérification renvoyé avec succès !
            </p>
          </div>
        )}
      </div>

      {/* Resend Email Dialog */}
      <Dialog open={isResendDialogOpen} onOpenChange={setIsResendDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renvoyer l'email de vérification</DialogTitle>
            <DialogDescription>Entrez votre adresse email pour recevoir un nouveau lien de vérification.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="resend-email"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Adresse email
              </label>
              <Input
                id="resend-email"
                type="email"
                placeholder="exemple@email.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full"
                disabled={isResendingToken}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsResendDialogOpen(false);
                setResendEmail("");
              }}
              disabled={isResendingToken}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleResendVerificationEmail}
              disabled={isResendingToken || !resendEmail}
              className=""
            >
              {isResendingToken ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

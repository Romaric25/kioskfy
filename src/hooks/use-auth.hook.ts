

import { authClient, getErrorMessage } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSelectedOrganizationStore } from "@/stores/use-selected-organization.store";
import { useState } from "react";

export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
  verify: () => [...authKeys.all, "verify"] as const,
  user: (userId: string) => [...authKeys.all, "user", userId] as const,
  users: () => [...authKeys.all, "users"] as const,
  userByEmail: (email: string) =>
    [...authKeys.all, "userByEmail", email] as const,
};

export const useAuth = () => {
  const router = useRouter();
  const { data, isPending, isRefetching, refetch } = authClient.useSession();
  let isExpired = false;
  const session = data?.session;
  const user = data?.user;
  const token = session?.token;
  const expiresAt = session?.expiresAt;
  if (expiresAt) {
    isExpired = expiresAt < new Date();
  }
  const isAuthenticated = !!token && !isExpired;
  const isLoading = isPending || isRefetching;

  const { clearSelectedOrganization } = useSelectedOrganizationStore();
  const logout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          clearSelectedOrganization();
          router.push("/");
        },
        onError: () => {
          toast.error("Failed to logout");
        }
      }
    });
  };

  return { user, token, expiresAt, isAuthenticated, isLoading, logout, refetch };
};

interface UseSocialAuthOptions {
  redirectUrl?: string;
  onError?: (error: string) => void;
}

export const useSocialAuth = (options: UseSocialAuthOptions = {}) => {
  const { redirectUrl = "/", onError } = options;
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [socialAuthError, setSocialAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setSocialAuthError(null);
    setIsGoogleLoading(true);
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: redirectUrl,
      },
      {
        onError: (ctx) => {
          const translatedError = getErrorMessage(ctx.error.code ?? "", "fr");
          const error = translatedError || ctx.error.message || "Une erreur est survenue lors de la connexion.";
          setSocialAuthError(error);
          onError?.(error);
          setIsGoogleLoading(false);
        },
        onSuccess: () => {
          setIsGoogleLoading(false);
        },
      }
    );
  };

  const handleFacebookSignIn = async () => {
    setSocialAuthError(null);
    setIsFacebookLoading(true);
    await authClient.signIn.social(
      {
        provider: "facebook",
        callbackURL: redirectUrl,
      },
      {
        onError: (ctx) => {
          const translatedError = getErrorMessage(ctx.error.code ?? "", "fr");
          const error = translatedError || ctx.error.message || "Une erreur est survenue lors de la connexion.";
          setSocialAuthError(error);
          onError?.(error);
          setIsFacebookLoading(false);
        },
        onSuccess: () => {
          setIsFacebookLoading(false);
        },
      }
    );
  };

  return {
    handleGoogleSignIn,
    handleFacebookSignIn,
    isGoogleLoading,
    isFacebookLoading,
    socialAuthError,
    setSocialAuthError,
  };
};

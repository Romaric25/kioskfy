

import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";
import { useSelectedOrganizationStore } from "@/stores/use-selected-organization.store";
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
          redirect("/");
        },
        onError: () => {
          toast.error("Failed to logout");
        }
      }
    });
  };

  return { user, token, expiresAt, isAuthenticated, isLoading, logout, refetch };
};


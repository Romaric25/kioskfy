import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SelectedOrganizationState } from "@/app/interfaces/selected-organization.interface";

export const useSelectedOrganizationStore = create<SelectedOrganizationState>()(
  persist(
    (set) => ({
      selectedOrganizationId: null,
      selectedOrganizationSlug: null,
      setSelectedOrganization: (id: string, slug: string) =>
        set({ selectedOrganizationId: id, selectedOrganizationSlug: slug }),
      clearSelectedOrganization: () =>
        set({ selectedOrganizationId: null, selectedOrganizationSlug: null }),
    }),
    {
      name: "selected-organization-storage",
    }
  )
);

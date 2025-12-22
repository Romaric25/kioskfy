import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SelectedOrganizationState {
  selectedOrganizationId: string | null;
  selectedOrganizationSlug: string | null;
  setSelectedOrganization: (id: string, slug: string) => void;
  clearSelectedOrganization: () => void;
}

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

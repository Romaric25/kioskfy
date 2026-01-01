export interface SelectedOrganizationState {
    selectedOrganizationId: string | null;
    selectedOrganizationSlug: string | null;
    setSelectedOrganization: (id: string, slug: string) => void;
    clearSelectedOrganization: () => void;
}

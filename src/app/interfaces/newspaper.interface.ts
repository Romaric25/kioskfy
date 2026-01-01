export interface NewspaperState {
    selectedNewspaperId: string | null;
    selectedNewspaperSlug: string | null;
    setSelectedNewspaper: (id: string, slug: string) => void;
    clearSelectedNewspaper: () => void;
}

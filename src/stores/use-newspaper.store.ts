import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NewspaperState {
  selectedNewspaperId: string | null;
  selectedNewspaperSlug: string | null;
  setSelectedNewspaper: (id: string, slug: string) => void;
  clearSelectedNewspaper: () => void;
}

export const useSelectedNewspaperStore = create<NewspaperState>()(
  persist(
    (set) => ({
      selectedNewspaperId: null,
      selectedNewspaperSlug: null,
      setSelectedNewspaper: (id: string, slug: string) =>
        set({ selectedNewspaperId: id, selectedNewspaperSlug: slug }),
      clearSelectedNewspaper: () =>
        set({ selectedNewspaperId: null, selectedNewspaperSlug: null }),
    }),
    {
      name: "selected-newspaper-storage",
    }
  )
);

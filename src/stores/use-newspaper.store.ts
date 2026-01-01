import { create } from "zustand";
import { persist } from "zustand/middleware";
import { NewspaperState } from "@/app/interfaces/newspaper.interface";

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

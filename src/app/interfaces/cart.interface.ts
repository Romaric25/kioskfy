import { NewspaperResponse } from "@/server/models/newspaper.model";

export interface CartState {
    items: NewspaperResponse[];
    addItem: (item: NewspaperResponse) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    isInCart: (id: string) => boolean;
    total: () => number;
}

export interface OrderState {
    selectedItemIds: string[];
    addItem: (id: string) => void;
    removeItem: (id: string) => void;
    hasItem: (id: string) => boolean;
    clearItems: () => void;
}

export interface OrderState {
    selectedItemIds: string[];
    addItem: (id: string) => void;
    removeItem: (id: string) => void;
    hasItem: (id: string) => boolean;
    clearItems: () => void;
}

/**
 * Type pour l'affichage des commandes dans le dashboard admin
 */
export interface AdminOrderResponse {
    id: string;
    userId: string | null;
    newspaperId: string;
    price: string;
    status: string;
    paymentId: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    user?: {
        name: string | null;
        email: string;
        image: string | null;
    } | null;
    newspaper?: {
        id: string;
        issueNumber: string;
        coverImage: string;
        price: string;
        publishDate: Date | string;
        organization: {
            id: string;
            name: string;
        } | null;
    } | null;
}

export interface PayoutStore {
    payoutId: string;
    setPayoutId: (payoutId: string) => void;
    clearPayoutId: () => void;
}

export interface MonerooCustomer {
    email: string;
    first_name: string;
    last_name: string;
    id?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country_code?: string;
    country?: string;
    zip_code?: string;
    environment?: string;
    created_at?: string;
    updated_at?: string;
}

export interface MonerooPaymentMetadata {
    order_id?: string;
    customer_id?: string;
    withdrawal_id?: string;
    [key: string]: any;
}

export interface InitializePaymentInput {
    amount: number;
    currency: string;
    description: string;
    customer: MonerooCustomer;
    return_url: string;
    metadata: MonerooPaymentMetadata;
    methods: string[];
    withdrawalId?: number;
}

export interface InitializePayoutInput {
    amount: number;
    currency: string;
    description: string;
    customer: MonerooCustomer;
    recipient: Record<string, any>;
    metadata: MonerooPaymentMetadata;
    method: string;
    withdrawalId?: number;
}

export interface PaymentResponse {
    success: boolean;
    data: any;
    message?: string;
}

export interface VerifyTransactionResponse {
    id: string;
    status: string; // "success", "failed", "pending", etc.
    is_processed: boolean;
    processed_at: string;
    amount: number;
    currency: string;
    amount_formatted: string;
    description: string;
    return_url: string;
    environment: string;
    initiated_at: string;
    checkout_url: string;
    payment_phone_number?: string;
    app?: {
        id: string;
        name: string;
        icon_url: string;
    };
    customer: MonerooCustomer;
    method?: {
        name: string;
        code: string;
        icon_url: string;
        environment: string;
    };
    gateway?: {
        name: string;
        account_name: string;
        code: string;
        icon_url: string;
        environment: string;
    };
    metadata?: MonerooPaymentMetadata;
}

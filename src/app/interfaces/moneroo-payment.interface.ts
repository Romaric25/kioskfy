export interface MonerooPaymentResponse {
    checkout_url: string;
    payment_id: string;
    [key: string]: any;
}

export interface MonerooPaymentVerifyApp {
    id: string;
    name: string;
    icon_url: string;
}

export interface MonerooPaymentVerifyCustomer {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country_code: string;
    country: string;
    zip_code: string;
    environment: string;
    created_at: string;
    updated_at: string;
}

export interface MonerooPaymentVerifyMethod {
    name: string;
    code: string;
    icon_url: string;
    environment: string;
}

export interface MonerooPaymentVerifyGateway {
    name: string;
    account_name: string;
    code: string;
    icon_url: string;
    environment: string;
}

export interface MonerooPaymentVerifyContext {
    ip: string;
    user_agent: string;
    country: string;
    local: string;
}

export interface MonerooPaymentVerifyData {
    id: string;
    status: "success" | "pending" | "failed" | "cancelled";
    is_processed: boolean;
    processed_at: string | null;
    amount: number;
    currency: string;
    amount_formatted: string;
    description: string;
    return_url: string;
    environment: string;
    initiated_at: string;
    checkout_url: string;
    payment_phone_number: string | null;
    app: MonerooPaymentVerifyApp;
    customer: MonerooPaymentVerifyCustomer;
    method: MonerooPaymentVerifyMethod | null;
    gateway: MonerooPaymentVerifyGateway | null;
    metadata: Record<string, string> | null;
    context: MonerooPaymentVerifyContext;
}

export interface MonerooPaymentVerifyResponse {
    success: boolean;
    message: string;
    data: MonerooPaymentVerifyData;
}

import { treaty } from '@elysiajs/eden'
import type { App } from '@/server'

// Use same-origin for browser requests to avoid CORS between www/non-www
const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        // Browser: use current origin (same origin = no CORS)
        return window.location.origin;
    }
    // Server-side: use env variable or fallback
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

export const client = treaty<App>(getBaseUrl()) 
import { treaty } from '@elysiajs/eden'
import type { App } from '@/server'

const isProduction = process.env.NODE_ENV === 'production';
export const client = treaty<App>(isProduction ? process.env.NEXT_PUBLIC_APP_URL as string : "http://localhost:3000") 
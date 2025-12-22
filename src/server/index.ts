import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { fromTypes, openapi } from '@elysiajs/openapi';
import { betterAuthPlugin } from '@/lib/plugins/better-auth-plugin';
import { OpenAPI } from '@/lib/openapi';
import { countriesService } from './services/countries.service';
import { newspapersService } from './services/newspapers.service';
import { categoriesService } from './services/categories.service';
import { paymentService } from './services/payment.service';
import { uploadsService } from './services/uploads.service';
import { organizationsService } from './services/organizations.service';
import { usersService } from './services/users.service';
import { serverTiming } from '@elysiajs/server-timing'

const isProduction = process.env.NODE_ENV === 'production';

const app = new Elysia({ prefix: '/api/v1' })
    .use(serverTiming())
    // Configure CORS for auth requests
    .use(
        cors({
            origin: [
                /.*\.kioskfy\.com$/,
                /.*\.localhost$/,
            ],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization'],
        })
    )
    // OpenAPI documentation - disabled in production via guard
    .use(
        openapi({
            references: fromTypes(),
            documentation: {
                info: {
                    title: 'Kioskfy API',
                    version: '1.0.0',
                    description: 'API documentation for Kioskfy',
                },
                tags: [
                    { name: 'General', description: 'General endpoints' },
                    { name: 'Auth', description: 'Authentication endpoints' },
                    { name: 'Admin', description: 'Administration système' },
                    { name: 'Public', description: 'Endpoints publics' },
                    { name: 'Payment', description: 'Endpoints de paiement' },
                    { name: 'Organizations', description: 'Endpoints des organisations' }
                ],
                paths: await OpenAPI.getPaths(),
                components: await OpenAPI.components,
            },
            path: '/docs',
        })
    )
    .use(countriesService)
    .use(newspapersService)
    .use(categoriesService)
    .use(paymentService)
    .use(uploadsService)
    .use(organizationsService)
    .use(usersService)
    // Block /docs access in production
    .onBeforeHandle(({ request, set }) => {
        if (isProduction && request.url.includes('/api/v1/docs')) {
            set.status = 404;
            return { error: 'Not Found' };
        }
    })

export default app;
export type App = typeof app;
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
import { favoritesService } from './services/favorites.service';
import { favoriteCountriesService } from './services/favorite-countries.service';
import { ordersService } from './services/orders.service';
import { accountingService } from './services/accounting.service';
import { withdrawalsService } from './services/withdrawals.service';
import { payoutsService } from './services/payouts.service';
import { adminStatsService } from './services/admin-stats.service';
import { geoipService } from './services/geoip.service';
import { settingsService } from './services/settings.service';
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
                    { name: 'Organizations', description: 'Endpoints des organisations' },
                    { name: 'Protected', description: 'Endpoints protégés (authentification requise)' },
                    { name: 'Orders', description: 'Gestion des commandes' },
                    { name: 'Accounting', description: 'Gestion comptable' },
                    { name: 'GeoIP', description: 'Géolocalisation IP' },
                    { name: 'Settings', description: 'Configuration du site' }
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
    .use(favoritesService)
    .use(favoriteCountriesService)
    .use(ordersService)
    .use(accountingService)
    .use(withdrawalsService)
    .use(payoutsService)
    .use(adminStatsService)
    .use(geoipService)
    .use(settingsService)
    // Block /docs access in production
    .onBeforeHandle(({ request, set }) => {
        if (isProduction && request.url.includes('/api/v1/docs')) {
            set.status = 404;
            return { error: 'Not Found' };
        }
    })

export default app;
export type App = typeof app;
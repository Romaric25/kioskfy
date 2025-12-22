import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
const laboUrl = process.env.NEXT_PUBLIC_LABO_URL;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

const adminHost = adminUrl ? new URL(adminUrl).hostname : "admin.kioskfy.com";
const laboHost = laboUrl ? new URL(laboUrl).hostname : "labo.kioskfy.com";
const appHost = appUrl ? new URL(appUrl).hostname : "app.kioskfy.com";

export default async function proxy(request: NextRequest) {
    const url = request.nextUrl.clone();
    const pathname = request.nextUrl.pathname;
    const hostname = request.headers.get('host') || 'localhost:3000';

    const hostnameWithoutPort = hostname.split(':')[0];
    const parts = hostnameWithoutPort.split('.');
    const isVercel = hostname.includes('vercel.app');
    const hasSubdomain = parts.length >= 3 || (parts.length === 2 && !['com', 'fr', 'org', 'net', 'io'].includes(parts[1]));
    const subdomain = hasSubdomain ? parts[0] : null;

    // Block /api/v1/docs in production
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && pathname.startsWith('/api/v1/docs')) {
        return new NextResponse(JSON.stringify({ error: 'Not Found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Ignorer les fichiers statiques, API, et images s'ils passent le matcher
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/static') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // ============================================
    // Redirections pour les sous-domaines admin et labo
    // Sur labo.kioskfy.com : toutes les routes qui ne commencent pas par /organization -> /organization/dashboard
    // Sur admin.kioskfy.com : toutes les routes qui ne commencent pas par /admin -> /admin/dashboard
    // ============================================

    // Routes autorisées sur le sous-domaine labo (commencent par /organization)
    const laboAllowedPrefixes = ['/organization'];
    // Routes autorisées sur le sous-domaine admin (commencent par /admin)
    const adminAllowedPrefixes = ['/admin'];

    // Détection du sous-domaine labo
    if (hostnameWithoutPort === laboHost || subdomain === 'labo') {
        const isAllowedOnLabo = laboAllowedPrefixes.some(prefix => pathname.startsWith(prefix));
        if (!isAllowedOnLabo && pathname !== '/') {
            // Rediriger vers /organization/dashboard
            return NextResponse.redirect(new URL('/organization/dashboard', request.url));
        }
    }

    // Détection du sous-domaine admin
    if (hostnameWithoutPort === adminHost || subdomain === 'admin') {
        const isAllowedOnAdmin = adminAllowedPrefixes.some(prefix => pathname.startsWith(prefix));
        if (!isAllowedOnAdmin && pathname !== '/') {
            // Rediriger vers /admin/dashboard
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
    }

    // Routes d'authentification partagées (seulement pour le domaine principal)
    const sharedAuthRoutes = ['/login', '/register', '/forgot-password'];
    if (sharedAuthRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Gestion des Tenants Dynamiques (Agences)
    // admin et labo sont gérés par next.config.ts, on ne les touche pas ici
    if (subdomain && !['www', 'admin', 'labo'].includes(subdomain) && !isVercel) {
        // Rewrite pour les tenants dynamiques: tenant.kioskfy.com -> /tenant
        url.pathname = `/${subdomain}${pathname}`;
        return NextResponse.rewrite(url);
    }

    // ============================================
    // Logique d'authentification (pour localhost et www)
    // ============================================

    const session = await auth.api.getSession({
        headers: await headers()
    });

    const isAgency = session?.user?.typeUser === "agency";
    const isClient = session?.user?.typeUser === "client";

    const ProtectedRoutes = ["/admin", "/dashboard", "/organization/dashboard"];
    const publicRoutes = ["/organization/login", "/organization/subscription", "/login", "/register"];

    const isProtectedRoute = ProtectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // Éviter les boucles de redirection
    const hasError = request.nextUrl.searchParams.has("error");

    const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );

    const isDashboard = pathname.includes("/dashboard");
    const isOrganizationDashboard = pathname.includes("/organization/dashboard");

    if (isPublicRoute && session && isClient && !hasError && !isDashboard) {
        // Client redirigé vers son dashboard
        return NextResponse.redirect(new URL(`/dashboard`, request.url));
    }

    if (isPublicRoute && session && isAgency && !hasError && !isOrganizationDashboard) {
        // Agence redirigée vers son dashboard
        // Sur le domaine labo, le dashboard est à la racine (/dashboard), pas /organization/dashboard
        if (subdomain === 'labo') {
            return NextResponse.redirect(new URL(`/dashboard`, request.url));
        }
        return NextResponse.redirect(new URL(`/organization/dashboard`, request.url));
    }

    if (isProtectedRoute) {
        // Pas connecté -> redirection login
        if (!session) {
            // Si on est déjà sur une page de login, on laisse passer pour éviter la boucle
            if (pathname.includes("/login")) {
                return NextResponse.next();
            }

            // Eviter la boucle: ne pas rediriger si on est déjà sur la page de login admin
            if (pathname.startsWith("/admin") || hostname === adminHost) {
                const loginUrl = new URL(`/admin/login`, request.url);
                loginUrl.searchParams.set("redirect", pathname);
                return NextResponse.redirect(loginUrl);
            }
            // Eviter la boucle: ne pas rediriger si on est déjà sur la page de login organization
            if (pathname.startsWith("/organization") || hostname === laboHost) {
                const loginUrl = new URL(`/organization/login`, request.url);
                loginUrl.searchParams.set("redirect", pathname);
                return NextResponse.redirect(loginUrl);
            }

            const loginUrl = new URL(`/login`, request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};

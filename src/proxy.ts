import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';


export default async function proxy(request: NextRequest) {
    const url = request.nextUrl.clone();
    const pathname = request.nextUrl.pathname;
    const hostname = request.headers.get('host') || 'localhost:3000';

    // Extraire le subdomain correctement (ignorer le port)
    const hostnameWithoutPort = hostname.split(':')[0];
    const parts = hostnameWithoutPort.split('.');

    // Si c'est localhost ou un domaine simple (pas de subdomain)
    const isLocalhost = hostnameWithoutPort === 'localhost' || hostnameWithoutPort === '127.0.0.1';
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

    // Routes d'authentification partagées (ne pas réécrire vers les sous-domaines)
    const sharedAuthRoutes = ['/login', '/register', '/forgot-password'];
    if (sharedAuthRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Si c'est localhost ou pas de subdomain, continuer avec la logique normale
    if (isLocalhost || !subdomain || subdomain === 'www' || isVercel) {
        // Continuer vers la logique d'authentification ci-dessous
    }
    // Pour admin subdomain
    else if (subdomain === 'admin') {
        // Laisser Next.js gérer via rewrites dans next.config.ts
    }
    // Pour labo subdomain
    else if (subdomain === 'labo') {
        // Laisser Next.js gérer via rewrites dans next.config.ts
    }
    // Pour les tenants (agences)
    else {
        // Note: Assurez-vous d'avoir un dossier src/app/[domain] ou gérez via une page dynamique
        // Pour l'instant, on redirige vers une route de rendu
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
        if (subdomain === 'labo') {
            return NextResponse.redirect(new URL(`/dashboard`, request.url));
        }
        return NextResponse.redirect(new URL(`/organization/dashboard`, request.url));
    }

    if (isProtectedRoute) {
        // Pas connecté -> redirection login
        if (!session) {
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

"use client";

import { useAuth } from "@/hooks/use-auth.hook";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function getBreadcrumbs(pathname: string) {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    const labelMap: Record<string, string> = {
        dashboard: "Tableau de bord",
        favoris: "Mes favoris",
        achats: "Mes achats",
        profil: "Mon profil",
        parametres: "Paramètres",
    };

    for (let i = 0; i < segments.length; i++) {
        const path = "/" + segments.slice(0, i + 1).join("/");
        const label = labelMap[segments[i]] || segments[i];
        breadcrumbs.push({ path, label });
    }

    return breadcrumbs;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login?redirect=/dashboard");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const breadcrumbs = getBreadcrumbs(pathname);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs.map((crumb, index) => (
                                <div key={crumb.path} className="flex items-center gap-2">
                                    {index > 0 && <BreadcrumbSeparator />}
                                    <BreadcrumbItem>
                                        {index === breadcrumbs.length - 1 ? (
                                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink href={crumb.path}>
                                                {crumb.label}
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                </div>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-4">
                    <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
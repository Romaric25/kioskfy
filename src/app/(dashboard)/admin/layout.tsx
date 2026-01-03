"use client";

import { AdminAppSidebar } from "@/components/admin/admin-app-sidebar";
import { AdminSiteHeader } from "@/components/admin/admin-site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Activity } from "react";

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const paths = ["/admin/newspapers/render", "/admin/login"]
    const pathname = usePathname();
    const showSidebar = !paths.includes(pathname);

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "19rem",
                } as React.CSSProperties
            }
        >
            <Activity mode={showSidebar ? "visible" : "hidden"}>
                <AdminAppSidebar />
            </Activity>
            <SidebarInset>
                <Activity mode={showSidebar ? "visible" : "hidden"}>
                    <AdminSiteHeader />
                </Activity>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-4">
                    <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

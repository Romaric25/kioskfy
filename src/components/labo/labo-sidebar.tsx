"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Newspaper,
    DollarSign,
    Settings,
    HelpCircle,
    Search,
    Plus,
    Eye,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { Logo } from "@/components/ui/logo";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth.hook";
import { useSelectedOrganizationStore } from "@/stores/use-selected-organization.store";

export function LaboSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const { user } = useAuth();
    const { selectedOrganizationId } = useSelectedOrganizationStore();

    const navMain = [
        {
            title: "Tableau de bord",
            url: "/organization/dashboard",
            icon: LayoutDashboard,
            isActive: pathname === "/organization/dashboard",
        },
        {
            title: "Vue d'ensemble",
            url: "/organization/dashboard/overview",
            icon: Eye,
            isActive: pathname.startsWith("/organization/dashboard/overview"),
        },
        {
            title: "Mes journaux",
            url: "/organization/dashboard/newspapers",
            icon: Newspaper,
            isActive: pathname.startsWith("/organization/dashboard/newspapers"),
        },
        {
            title: "Revenus",
            url: "/organization/dashboard/revenue",
            icon: DollarSign,
            isActive: pathname.startsWith("/organization/dashboard/revenue"),
        },
    ];

    const navSecondary = [
        {
            title: "Paramètres",
            url: "/organization/dashboard/settings",
            icon: Settings,
        },
        {
            title: "Aide",
            url: "#",
            icon: HelpCircle,
        },
        {
            title: "Rechercher",
            url: "#",
            icon: Search,
        },
    ];

    const userData = {
        name: user?.name ?? "Utilisateur",
        email: user?.email ?? "",
        avatar: user?.image ?? "",
        lastName: user?.lastName ?? "",
    };

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link href="/organization/dashboard">
                                <Logo width={80} height={80} />
                                <span className="text-base font-semibold">Kioskfy Labo</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain
                    items={navMain}
                    publishUrl="/organization/dashboard/publish"
                    isDisabled={!selectedOrganizationId}
                />
                <NavSecondary items={navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userData} />
            </SidebarFooter>
        </Sidebar>
    );
}

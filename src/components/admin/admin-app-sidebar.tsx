"use client"

import * as React from "react"
import {
    LayoutDashboard,
    Users,
    Building2,
    Newspaper,
    FileText,
    BadgeDollarSign,
    Settings,
    HelpCircle,
    Search,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth.hook"
import Link from "next/link"

export function AdminAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user } = useAuth()

    const data = {
        user: {
            name: user?.name || "Admin",
            email: user?.email || "admin@kioskfy.com",
            avatar: user?.image || "/avatars/admin.jpg",
        },
        navMain: [
            {
                title: "Tableau de bord",
                url: "/admin/home",
                icon: LayoutDashboard,
            },
            {
                title: "Organisations",
                url: "/admin/organizations",
                icon: Building2,
            },
            {
                title: "Utilisateurs",
                url: "/admin/users",
                icon: Users,
            },
            {
                title: "Journaux",
                url: "/admin/newspapers",
                icon: Newspaper,
            },
            {
                title: "Commandes",
                url: "/admin/orders",
                icon: FileText,
            },
            {
                title: "Retraits des agences",
                url: "/admin/withdrawals",
                icon: BadgeDollarSign,
            },
        ],
        navSecondary: [
            {
                title: "Paramètres",
                url: "/admin/settings",
                icon: Settings,
            },
            {
                title: "Aide",
                url: "#",
                icon: HelpCircle,
            },
        ],
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin/home">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <LayoutDashboard className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Kioskfy Admin</span>
                                    <span className="truncate text-xs">Administration</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}

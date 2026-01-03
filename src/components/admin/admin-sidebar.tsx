"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Building2,
    Newspaper,
    CreditCard,
    Settings,
    LogOut,
    FileText,
    BadgeDollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth.hook";

const sidebarItems = [
    {
        title: "Tableau de bord",
        href: "/admin/home",
        icon: LayoutDashboard,
    },
    {
        title: "Organisations",
        href: "/admin/organizations",
        icon: Building2,
    },
    {
        title: "Utilisateurs",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Journaux",
        href: "/admin/newspapers",
        icon: Newspaper,
    },
    {
        title: "Commandes",
        href: "/admin/orders",
        icon: FileText,
    },
    {
        title: "Retraits",
        href: "/admin/withdrawals",
        icon: BadgeDollarSign,
    },
    {
        title: "Paramètres",
        href: "/admin/settings",
        icon: Settings,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card">
            <div className="flex h-14 items-center border-b px-6">
                <Link href="/admin/home" className="flex items-center gap-2 font-semibold">
                    <span className="text-xl font-bold">Kioskfy Admin</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {sidebarItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    pathname === item.href && "bg-muted text-primary"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t p-4">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => logout()}
                >
                    <LogOut className="h-4 w-4" />
                    Se deconnecter
                </Button>
            </div>
        </div>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import {
  LayoutDashboard,
  Newspaper,
  DollarSign,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth.hook";
import { useSelectedOrganizationStore } from "@/stores/use-selected-organization.store";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
  const { selectedOrganizationId } = useSelectedOrganizationStore();
  const pathname = usePathname();
  const { logout } = useAuth();

  const routes = [
    {
      label: "Tableau de bord",
      icon: LayoutDashboard,
      href: `/organization/dashboard`,
      active: pathname === `/organization/dashboard`,
    },
    {
      label: "Vue d'ensemble",
      icon: Plus,
      href: `/organization/dashboard/overview`,
      active: pathname.startsWith(`/organization/dashboard/overview`),
    },

    {
      label: "Mes journaux",
      icon: Newspaper,
      href: `/organization/dashboard/newspapers`,
      active: pathname.startsWith(`/organization/dashboard/newspapers`),
    },
    {
      label: "Revenus",
      icon: DollarSign,
      href: `/organization/dashboard/revenue`,
      active: pathname.startsWith(`/organization/dashboard/revenue`),
    },
    {
      label: "Paramètres",
      icon: Settings,
      href: `/organization/dashboard/settings`,
      active: pathname.startsWith(`/organization/dashboard/settings`),
    },
  ];

  return (
    <div className={cn("pb-12 min-h-screen border-r bg-background", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center px-4 mb-8">
            <Logo />
          </div>
          <div className="space-y-1">
            <Button
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 mb-4"
              disabled={!selectedOrganizationId}
              asChild={!!selectedOrganizationId}
            >
              {selectedOrganizationId ? (
                <Link href={`/organization/dashboard/publish`}>
                  <Plus className="h-4 w-4" />
                  Publier une édition
                </Link>
              ) : (
                <span>
                  <Plus className="h-4 w-4" />
                  Publier une édition
                </span>
              )}
            </Button>
            {routes.map((route) => {
              const isDisabled = !selectedOrganizationId;
              return (
                <Button
                  key={route.href}
                  variant={route.active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    route.active && "bg-secondary",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={isDisabled}
                  asChild={!isDisabled}
                >
                  {isDisabled ? (
                    <div className="flex items-center">
                      <route.icon className="mr-2 h-4 w-4" />
                      {route.label}
                    </div>
                  ) : (
                    <Link href={route.href}>
                      <route.icon className="mr-2 h-4 w-4" />
                      {route.label}
                    </Link>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 px-4 w-full">
        <Button
          onClick={logout}
          variant="outline"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useAuth } from "@/hooks/use-auth.hook";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    User,
    Heart,
    ShoppingBag,
    Settings,
    LogOut,
    LayoutDashboard,
    ChevronsUpDown,
    Newspaper
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

const navigationItems = [
    {
        title: "Menu principal",
        items: [
            {
                title: "Tableau de bord",
                url: "/dashboard",
                icon: LayoutDashboard,
            },
            {
                title: "Mes favoris",
                url: "/dashboard/favoris",
                icon: Heart,
            },
            {
                title: "Mes achats",
                url: "/dashboard/achats",
                icon: ShoppingBag,
            },
        ],
    },
    {
        title: "Compte",
        items: [
            {
                title: "Mon profil",
                url: "/dashboard/profil",
                icon: User,
            },
            {
                title: "Paramètres",
                url: "/dashboard/parametres",
                icon: Settings,
            },
        ],
    },
];

export function AppSidebar() {
    const { user, logout } = useAuth();
    const { isMobile, setOpenMobile } = useSidebar();
    const pathname = usePathname();

    const userInitials = user?.name
        ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild onClick={handleLinkClick}>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-primary-foreground">
                                    <Image src="/favicon.ico" alt="Logo" width={30} height={30} />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Kioskfy</span>
                                    <span className="truncate text-xs text-muted-foreground">Mon espace</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {navigationItems.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const isActive = pathname === item.url;
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                tooltip={item.title}
                                                onClick={handleLinkClick}
                                            >
                                                <Link href={item.url}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
                                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user?.name}</span>
                                        <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
                                            <AvatarFallback className="rounded-lg">
                                                {userInitials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user?.name}</span>
                                            <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild onClick={handleLinkClick}>
                                    <Link href="/dashboard/profil">
                                        <User className="mr-2 h-4 w-4" />
                                        Mon profil
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild onClick={handleLinkClick}>
                                    <Link href="/dashboard/parametres">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Paramètres
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { handleLinkClick(); logout(); }} className="text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Déconnexion
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}

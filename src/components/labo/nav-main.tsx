"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavMainProps {
    items: {
        title: string;
        url: string;
        icon?: LucideIcon;
        isActive?: boolean;
    }[];
    publishUrl?: string;
    isDisabled?: boolean;
}

export function NavMain({ items, publishUrl, isDisabled }: NavMainProps) {
    const pathname = usePathname();
    const { isMobile, setOpenMobile } = useSidebar();

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {publishUrl && (
                        <SidebarMenuItem className="flex items-center gap-2">
                            <SidebarMenuButton
                                asChild={!isDisabled}
                                tooltip="Publier"
                                className={cn(
                                    "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear",
                                    isDisabled && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {isDisabled ? (
                                    <span className="flex items-center gap-2">
                                        <Plus className="size-4" />
                                        <span>Publier une édition</span>
                                    </span>
                                ) : (
                                    <Link
                                        href={publishUrl}
                                        onClick={() => {
                                            if (isMobile) {
                                                setOpenMobile(false);
                                            }
                                        }}
                                    >
                                        <Plus className="size-4" />
                                        <span>Publier une édition</span>
                                    </Link>
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = item.isActive ?? pathname === item.url;
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild={!isDisabled}
                                    tooltip={item.title}
                                    isActive={isActive}
                                    className={cn(
                                        isDisabled && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {isDisabled ? (
                                        <span className="flex items-center gap-2">
                                            {item.icon && <item.icon className="size-4" />}
                                            <span>{item.title}</span>
                                        </span>
                                    ) : (
                                        <Link
                                            href={item.url}
                                            onClick={() => {
                                                if (isMobile) {
                                                    setOpenMobile(false);
                                                }
                                            }}
                                        >
                                            {item.icon && <item.icon className="size-4" />}
                                            <span>{item.title}</span>
                                        </Link>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

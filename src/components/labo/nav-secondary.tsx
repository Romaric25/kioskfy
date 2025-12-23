"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavSecondaryProps extends React.ComponentPropsWithoutRef<typeof SidebarGroup> {
    items: {
        title: string;
        url: string;
        icon: LucideIcon;
    }[];
}

export function NavSecondary({ items, className, ...props }: NavSecondaryProps) {
    const { isMobile, setOpenMobile } = useSidebar();

    return (
        <SidebarGroup className={cn(className)} {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild tooltip={item.title}>
                                <Link
                                    href={item.url}
                                    onClick={() => {
                                        if (isMobile) {
                                            setOpenMobile(false);
                                        }
                                    }}
                                >
                                    <item.icon className="size-4" />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

"use client"

import React from "react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ROUTE_LABELS } from "@/lib/route-labels"

export function AdminSiteHeader() {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean).slice(1) // remove "admin"

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mr-2 h-4"
                />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href="/admin/home">Admin</BreadcrumbLink>
                        </BreadcrumbItem>
                        {segments.map((segment, index) => {
                            // Hide IDs from breadcrumb (assuming IDs are > 24 chars)
                            if (segment.length > 24) return null;

                            // Logic pour label: Dictionnaire ou Capitalisation
                            let label = ROUTE_LABELS[segment] || segment.replace(/-/g, " ");

                            return (
                                <React.Fragment key={segment}>
                                    <BreadcrumbSeparator className="hidden md:block" />
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href={`/admin/${segments.slice(0, index + 1).join('/')}`} className="capitalize">
                                            {label}
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                </React.Fragment>
                            )
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
            </div>
        </header>
    )
}

"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ShoppingBag, Newspaper, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
    favoritesCount: number;
}

export function QuickActions({ favoritesCount }: QuickActionsProps) {
    const actions = [
        {
            href: "/newspapers",
            icon: Newspaper,
            iconColor: "text-primary",
            iconBg: "bg-primary/10",
            title: "Explorer les journaux",
            description: "Découvrez les dernières parutions",
        },
        {
            href: "/dashboard/favoris",
            icon: Heart,
            iconColor: "text-red-500",
            iconBg: "bg-red-500/10",
            title: "Mes favoris",
            description: `${favoritesCount} journaux sauvegardés`,
        },
        {
            href: "/dashboard/achats",
            icon: ShoppingBag,
            iconColor: "text-blue-500",
            iconBg: "bg-blue-500/10",
            title: "Mes achats",
            description: "Accédez à vos journaux achetés",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {actions.map((action) => (
                <Card key={action.href} className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <Link href={action.href}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className={`p-2 ${action.iconBg} rounded-lg`}>
                                <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-base">{action.title}</CardTitle>
                                <CardDescription>{action.description}</CardDescription>
                            </div>
                            <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                    </Link>
                </Card>
            ))}
        </div>
    );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface Stat {
    title: string;
    value: string | number;
    description: string;
    icon: LucideIcon;
    trend: string;
    trendUp: boolean | null;
    href?: string;
}

interface DashboardStatsProps {
    stats: Stat[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
                const CardElement = (
                    <Card className={cn(
                        "h-full transition-all duration-200",
                        stat.href && "hover:bg-muted/50 hover:shadow-sm cursor-pointer"
                    )}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                            {stat.trendUp !== null && (
                                <div className="flex items-center pt-1">
                                    {stat.trendUp ? (
                                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className={`text-xs ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                                        {stat.trend}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );

                if (stat.href) {
                    return (
                        <Link key={stat.title} href={stat.href} className="block h-full">
                            {CardElement}
                        </Link>
                    );
                }

                return (
                    <div key={stat.title} className="h-full">
                        {CardElement}
                    </div>
                );
            })}
        </div>
    );
}

import { Button } from "./button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Activity } from "react";

interface SectionProps {
    title: string;
    description?: string;
    action?: {
        label: string;
        href: string;
    };
    children: React.ReactNode;
    className?: string;
}

export function Section({ title, description, action, children, className }: SectionProps) {
    return (
        <section className={`py-4 md:py-8 ${className}`}>
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Activity mode={!title ? "hidden" : "visible"}>
                                <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                            </Activity>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                                {title}
                            </h2>
                        </div>
                        {description && <p className="text-muted-foreground text-muted-foreground ml-4 pl-3 border-l border-border">{description}</p>}
                    </div>
                    {action && (
                        <Button variant="ghost" className="group w-fit" asChild>
                            <Link href={action.href}>
                                {action.label}
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    )}
                </div>
                {children}
            </div>
        </section>
    );
}

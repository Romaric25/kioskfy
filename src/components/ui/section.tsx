import { Button } from "./button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

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
                        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
                        {description && <p className="text-muted-foreground">{description}</p>}
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

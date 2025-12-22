import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Calendar, Download } from "lucide-react";

interface MagazineCardProps {
    title: string;
    date: string;
    price: string;
    coverImage: string;
    category: string;
}

export function MagazineCard({ title, date, price, coverImage, category }: MagazineCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
            <div className="aspect-[3/4] overflow-hidden bg-muted relative">
                <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center rounded-full border bg-background/90 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        {category}
                    </span>
                </div>
                {coverImage && coverImage !== "/placeholder.jpg" ? (
                    <Image
                        src={coverImage}
                        alt={`Couverture ${title}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                        <span className="text-sm">Couverture</span>
                    </div>
                )}
            </div>
            <div className="p-4 space-y-3">
                <div className="space-y-1">
                    <h3 className="font-semibold leading-none tracking-tight line-clamp-1">{title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {date}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">{price}</span>
                    <Button size="sm" variant="secondary" className="h-8">
                        <Download className="mr-2 h-3 w-3" />
                        Acheter
                    </Button>
                </div>
            </div>
            <Link href="#" className="absolute inset-0 z-0">
                <span className="sr-only">Voir les détails de {title}</span>
            </Link>
        </div>
    );
}

import { Skeleton } from "../ui/skeleton";

export function NewspaperCardSkeleton() {
    return (
        <div className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="aspect-[3/4] overflow-hidden bg-muted relative">
                <Skeleton className="h-full w-full" />
            </div>
            <div className="p-4 space-y-3">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-8 w-20" />
                </div>
            </div>
        </div>
    );
}

import { Skeleton } from "@/components/ui/skeleton";

export function NewspaperCardSkeleton() {
    return (
        <div className="group relative flex flex-col gap-4 animate-pulse">
            {/* Skeleton de la couverture */}
            <div className="relative aspect-[3/4] w-full">
                <Skeleton className="h-full w-full rounded-lg" />
                {/* Badge Pays skeleton */}
                <div className="absolute top-3 left-3 z-20">
                    <Skeleton className="h-7 w-16 rounded-full" />
                </div>
                {/* Badge Prix skeleton */}
                <div className="absolute bottom-3 right-3 z-20">
                    <Skeleton className="h-8 w-20 rounded-full" />
                </div>
            </div>

            {/* Skeleton des informations */}
            <div className="space-y-2 px-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
            </div>
        </div>
    );
}

export function NewspapersGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <NewspaperCardSkeleton key={index} />
            ))}
        </div>
    );
}

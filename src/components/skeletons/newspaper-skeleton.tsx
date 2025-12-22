import { Skeleton } from "../ui/skeleton";

export const NewspaperSkeleton = () => {
    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-5 lg:col-span-4">
                    <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                </div>
                <div className="md:col-span-7 lg:col-span-8 space-y-6">
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-5 w-1/3" />
                    </div>
                    <Skeleton className="h-px w-full" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                    <Skeleton className="h-px w-full" />
                    <Skeleton className="h-40 w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
};

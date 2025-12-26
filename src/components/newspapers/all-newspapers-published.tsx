"use client";

import { usePublishedNewspapers } from "@/hooks/use-newspapers.hook";
import { NewspaperCard } from "@/components/newspaper-card";
import { Skeleton } from "@/components/ui/skeleton";
import { NewspapersGridSkeleton, NewspaperCardSkeleton } from "@/components/newspapers/newspapers-skeleton";
import { EmptyState, ErrorState } from "@/components/newspapers/newspapers-states";
import { Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import { AllCommunContent } from "./all-commun-content";

const ITEMS_PER_PAGE = 12;

interface AllNewspapersPublishedProps {
    title?: string;
    showTitle?: boolean;
    limit?: number;
    enableInfiniteScroll?: boolean;
}

export const AllNewspapersPublished = () => {

    const { newspapers, newspapersLoading, newspapersError } = usePublishedNewspapers();

    return (
        <AllCommunContent title="Journaux publiés" data={newspapers?.data ?? undefined} isLoading={newspapersLoading} error={newspapersError} />
    );
}
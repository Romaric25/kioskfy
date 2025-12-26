"use client";


import { usePublishedMagazines } from "@/hooks/use-newspapers.hook";
import { AllCommunContent } from "./all-commun-content";

export const AllMagazinesPublished = () => {
    
    const { magazines, magazinesLoading, magazinesError } = usePublishedMagazines();

    return (
        <AllCommunContent title="Magazines publiés" data={magazines?.data} isLoading={magazinesLoading} error={magazinesError} />
    );
}
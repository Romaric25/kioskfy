import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "FAQ | kioskfy",
    description: "FAQ - kioskfy",
    robots: {
        index: false,
        follow: false,
    },
};

export default function FaqPage() {
    return (
        <div>
            <h1>FAQ</h1>
        </div>
    );
}
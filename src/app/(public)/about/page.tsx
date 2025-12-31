import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
export const metadata: Metadata = {
    title: "À propos | kioskfy",
    description: "À propos - kioskfy",
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: `${baseUrl}/about`,
    },
};

export default function AboutPage() {
    return <div>À propos</div>;
}
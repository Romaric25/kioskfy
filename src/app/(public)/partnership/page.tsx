import { Partnership } from "@/components/partnership";
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

export const metadata: Metadata = {
  title: "Partenariat | kioskfy",
  description: "Partenariat - kioskfy",
  alternates: {
    canonical: `${baseUrl}/partnership`,
  },
};

export default function PartnershipPage() {
  return (
    <Partnership />
  );
}

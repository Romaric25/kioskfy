import { Sidebar } from "@/components/labo/sidebar";
import { Header } from "@/components/labo/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <div className="hidden md:block w-64 fixed inset-y-0 z-50">
        <Sidebar />
      </div>
      <div className="md:pl-64 flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 md:p-8 pt-6">{children}</main>
      </div>
    </div>
  );
}

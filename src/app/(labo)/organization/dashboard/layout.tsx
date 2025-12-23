import { LaboSidebar } from "@/components/labo/labo-sidebar";
import { LaboHeader } from "@/components/labo/labo-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <LaboSidebar variant="inset" />
      <SidebarInset>
        <LaboHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

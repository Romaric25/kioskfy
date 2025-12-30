import { Header } from "@/components/menus/header";
import { Footer } from "@/components/footer";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return <>
    <Header />
    {children}
    <Footer />
  </>;
}

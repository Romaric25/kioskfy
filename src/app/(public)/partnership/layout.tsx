import { Footer } from '@/components/footer';
import { Header } from '@/components/menus/header';

interface PublicLayoutProps {
  children: React.ReactNode;
}
export const metadata = {
  title: "Partenariat | kioskfy",
  description: "Partenariat - kioskfy",
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return <>
    <Header />
    {children}
    <Footer />
  </>;
}

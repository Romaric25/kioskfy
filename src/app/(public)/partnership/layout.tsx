import { Footer } from '@/components/footer';
import { Header } from '@/components/menus/header';

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

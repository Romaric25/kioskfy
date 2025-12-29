import { Footer } from '@/components/footer';
import { Header } from '@/components/menus/header';
import { CountriesController } from '@/server/controllers/countries.controller';
import { OrganizationsController } from '@/server/controllers/organizations.controller';
import { Metadata } from 'next';

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

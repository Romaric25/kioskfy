
interface PublicLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: "Panier",
  description: "Panier de courses",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return <>
    {children}
  </>;
}

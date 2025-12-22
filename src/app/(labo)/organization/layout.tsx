interface LaboLayoutProps {
  children: React.ReactNode;
}

export default async function LaboLayout({
  children,
}: LaboLayoutProps) {
  return <>
    {children}
  </>;
}

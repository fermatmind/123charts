export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section data-zone="public">{children}</section>;
}

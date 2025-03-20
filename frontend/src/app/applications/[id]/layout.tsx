export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

// This is needed for static export
export async function generateStaticParams() {
  return [];
} 
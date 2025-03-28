import Loading from "./Loading";

interface RntSuspenseProps {
  children: React.ReactNode;
  isLoading?: boolean;
  fallback?: React.ReactNode;
}

export default function RntSuspense({ children, isLoading = false, fallback }: RntSuspenseProps) {
  if (isLoading) return fallback ? <>{fallback}</> : <Loading />;
  return <>{children}</>;
}

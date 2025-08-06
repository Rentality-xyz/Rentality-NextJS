import Search from "./guest/search";
import useUserRole from "@/hooks/useUserRole";
import Loading from "@/components/common/Loading";
import { useAuth } from "@/contexts/auth/authContext";
import React, { useEffect } from "react";
import { useRouter } from "next/router";

function Home() {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Search />;
  }

  return <AuthenticatedHome />;
}

function AuthenticatedHome() {
  const { isLoading, userRole, isHost } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    
    if (isHost(userRole)) {
      router.push("/host");
    } else {
      router.push("/guest");
    }
  }, [isLoading, userRole, isHost, router]);

  return <Loading />;
}
Home.allowAnonymousAccess = Search.allowAnonymousAccess;

export default Home;

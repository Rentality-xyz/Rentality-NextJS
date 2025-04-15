import Search from "./guest/search";
import useUserRole from "@/hooks/useUserRole";
import Loading from "@/components/common/Loading";
import { useAuth } from "@/contexts/auth/authContext";
import React, { useEffect } from "react";
import { useRouter } from "next/router";

function Home() {
  const { isLoading, userRole, isHost } = useUserRole();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isHost(userRole)) {
      router.push("/host");
    }
    else if (!isLoading && isAuthenticated && !isHost(userRole)) { 
      router.push("/guest");
    }
  }, [isLoading, userRole, isHost, router]);

  if (!isAuthenticated) {
    return <Search />;
  }

  return <Loading />;
}

Home.allowAnonymousAccess = Search.allowAnonymousAccess;

export default Home;

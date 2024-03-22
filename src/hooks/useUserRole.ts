import { useRouter } from "next/router";
import { useMemo } from "react";

const useUserRole = () => {
  const router = useRouter();
  const isHost = useMemo(() => {
    return router.route.startsWith("/host");
  }, [router.route]);

  return { isHost } as const;
};

export default useUserRole;

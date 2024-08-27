import { useRouter } from "next/router";
import { useMemo } from "react";

const useUserMode = () => {
  const router = useRouter();
  const isHost = useMemo(() => {
    return router.route.startsWith("/host");
  }, [router.route]);

  return { isHost } as const;
};

export default useUserMode;

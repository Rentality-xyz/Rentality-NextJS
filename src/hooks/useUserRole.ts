import { useRouter } from "next/router";
import { useMemo } from "react";

const useUserRole = () => {
  const router = useRouter();
  const isHost = useMemo(() => {
    console.log(`useUserRole: router.route has changed | isHost has new value `);
    return router.route.startsWith("/host");
  }, [router.route]);

  return { isHost } as const;
};

export default useUserRole;

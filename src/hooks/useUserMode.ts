import { useRouter } from "next/router";
import { useMemo } from "react";

export type UserMode = "Guest" | "Host" | "Admin";

const useUserMode = () => {
  const router = useRouter();

  const userMode: UserMode = useMemo(() => {
    if (router.route.startsWith("/host")) return "Host";
    if (router.route.startsWith("/admin")) return "Admin";
    return "Guest";
  }, [router.route]);

  return { userMode, isHost, isGuest, isAdmin } as const;
};

function isHost(mode: UserMode) {
  return mode === "Host";
}

function isGuest(mode: UserMode) {
  return mode === "Guest";
}

function isAdmin(mode: UserMode) {
  return mode === "Admin";
}

export default useUserMode;

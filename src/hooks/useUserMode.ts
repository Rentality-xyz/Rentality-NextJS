import { useRouter } from "next/router";
import { useMemo } from "react";

export type UserMode = "Guest" | "Host" | "Admin";

export function isHost(mode: UserMode) {
  return mode === "Host";
}
export function isGuest(mode: UserMode) {
  return mode === "Guest";
}
export function isAdmin(mode: UserMode) {
  return mode === "Admin";
}

const useUserMode = () => {
  const router = useRouter();

  const userMode: UserMode = useMemo(() => {
    if (router.route.startsWith("/host")) return "Host";
    if (router.route.startsWith("/admin")) return "Admin";
    return "Guest";
  }, [router.route]);

  return { userMode } as const;
};

export default useUserMode;

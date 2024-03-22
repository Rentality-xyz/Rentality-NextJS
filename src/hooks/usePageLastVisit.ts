import { isEmpty } from "@/utils/string";
import { useRouter } from "next/router";

const getPageId = (route: string) => {
  const pageIdFromRoute = route
    .split("/")
    .filter((_, index) => {
      return index >= 1 && index <= 3;
    })
    .join("_");

  return isEmpty(pageIdFromRoute) || pageIdFromRoute === "guest"
    ? "guest_search"
    : pageIdFromRoute === "host"
      ? "host_vehicles_listings"
      : pageIdFromRoute;
};

const savePageLastVisitedDateTime = (page: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(`${page}_lastVisited`, `${new Date().getTime()}`);
  }
};

const getPageLastVisitedDateTime = (page: string) => {
  if (typeof window === "undefined") return new Date();

  const savedTime = localStorage.getItem(`${page}_lastVisited`) ?? 0;
  return new Date(Number(savedTime));
};

const usePageLastVisit = () => {
  const router = useRouter();
  const pageId = getPageId(router.route);
  savePageLastVisitedDateTime(pageId);

  return { pageId, savePageLastVisitedDateTime, getPageLastVisitedDateTime } as const;
};

export default usePageLastVisit;

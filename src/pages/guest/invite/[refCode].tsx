import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Invite() {
  const route = useRouter();
  useEffect(() => {
    const pathParts = route.asPath.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    localStorage.setItem("promo", lastPart);
    route.push("/guest/profile");
  }, [route]);

  return <div></div>;
}

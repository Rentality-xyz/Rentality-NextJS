import Listings from "./listings";
import { useRouter } from "next/router";
import { useEffect } from "react";

function Vehicles() {

  const router = useRouter();
  const listingsPath = "/host/vehicles/listings"

  useEffect(() => {
    if (router.pathname !== listingsPath) {
      router.push(listingsPath);
    }
  }, [router]);

  return <Listings />;
}

export default Vehicles;

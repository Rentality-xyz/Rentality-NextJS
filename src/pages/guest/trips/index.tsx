import Booked from "./booked";
import { useRouter } from "next/router";
import { useEffect } from "react";

function Trips() {

  const router = useRouter();
  const bookedPath = "/guest/trips/booked"

  useEffect(() => {
    if (router.pathname !== bookedPath) {
      router.push(bookedPath);
    }
  }, [router]);

  return <Booked />;
}

export default Trips;

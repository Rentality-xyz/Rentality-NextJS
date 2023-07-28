import Link from "next/link";
import BaseSideNavMenu from "@/components/baseSideNavMenu/baseSideNavMenu";

export default function HostSideNavMenu() {
  return (
    <BaseSideNavMenu>
      <div className="pt-4">
        <div className="py-2 text-xl font-bold">Trips</div>
        <div className="py-1 h-12">
          <Link href="/host/trips/booked">Booked</Link>
        </div>
        <div className="py-1 h-12">
          <Link href="/host/trips/history">History</Link>
        </div>
      </div>
      <div className="pt-4">
        <div className="py-2 text-xl font-bold">Vehicles</div>
        <div className="py-1 h-12">
          <Link href="/host/vehicles/listings">Listing</Link>
        </div>
      </div>
    </BaseSideNavMenu>
  );
}

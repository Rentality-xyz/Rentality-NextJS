import Link from "next/link";
import BaseSideNavMenu from "@/components/baseSideNavMenu/baseSideNavMenu";

export default function GuestSideNavMenu() {
  return (
    <BaseSideNavMenu>
      <div className="pt-4">
        <div className="py-2 text-xl font-bold">
          <Link href="/guest/search">Search</Link>
        </div>
      </div>
      <div className="pt-4">
        <div className="py-2 text-xl font-bold">Trips</div>
        <div className="py-1 h-12">
          <Link href="/guest/trips/booked">Booked</Link>
        </div>
        <div className="py-1 h-12">
          <Link href="/guest/trips/history">History</Link>
        </div>
      </div>
    </BaseSideNavMenu>
  );
}

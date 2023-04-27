import HostLayout from "@/components/host/layout/hostLayout";
import ListingItem from "@/components/host/listingItem";

export default function Listings() {
  return (
    <HostLayout>
      <div className="flex flex-col pl-8 pt-4">
        <div className="flex flex-row mr-16 place-content-between">
          <div className="text-2xl">Listing</div>
          <button>Add Listing</button>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2">
          <ListingItem />
          <ListingItem />
          <ListingItem />
          <ListingItem />
          <ListingItem />
        </div>
      </div>
    </HostLayout>
  );
}

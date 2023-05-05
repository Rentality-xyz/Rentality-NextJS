import HostLayout from "@/components/host/layout/hostLayout";
import ListingItem, { CarInfo } from "@/components/host/listingItem";
import useMyListings from "@/hooks/useMyListings";
import Link from "next/link";

export default function Listings() {
  const [dataFetched, myListings] = useMyListings();

  return (
    <HostLayout>
      <div className="flex flex-col px-8 pt-4">
        <div className="flex flex-row justify-between items-center">
          <div className="text-2xl">
            <strong>Listings</strong>
          </div>
          <Link href="/host/vehicles/add">
            <button className="w-56 h-16 bg-violet-700 rounded-md">
              Add Listing
            </button>
          </Link>
        </div>
        {!dataFetched ? (
          <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
            Loading...
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 my-4">
            {myListings != null && myListings.length > 0 ? (
              myListings.map((value) => {
                return (
                  <ListingItem
                    key={value.tokenId}
                    carInfo={value}
                  ></ListingItem>
                );
              })
            ) : (
              <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                You dont have listed cars
              </div>
            )}
          </div>
        )}
      </div>
    </HostLayout>
  );
}

import HostLayout from "@/components/host/layout/hostLayout";
import ListingItem from "@/components/host/listingItem";
import PageTitle from "@/components/pageTitle/pageTitle";
import useMyListings from "@/hooks/host/useMyListings";
import Link from "next/link";

export default function Listings() {
  const [dataFetched, myListings] = useMyListings();

  return (
    <HostLayout>
      <div className="flex flex-col px-8 pt-4">        
        <PageTitle title="Listings" actions={[{text:"Add Listing", link:"/host/vehicles/add"}]}/>
        {!dataFetched ? (
          <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
            Loading...
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 my-4">
            {myListings != null && myListings.length > 0 ? (
              myListings.map((value) => {
                return <ListingItem key={value.carId} carInfo={value} />;
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

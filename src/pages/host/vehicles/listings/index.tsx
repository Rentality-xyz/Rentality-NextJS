import Layout from "@/components/layout/layout";
import ListingItem from "@/components/host/listingItem";
import PageTitle from "@/components/pageTitle/pageTitle";
import useMyListings from "@/hooks/host/useMyListings";

export default function Listings() {
  const [isLoading, myListings] = useMyListings();

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title="Listings" actions={[{ text: "Add Listing", link: "/host/vehicles/add" }]} />
        {isLoading ? (
          <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">Loading...</div>
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
    </Layout>
  );
}

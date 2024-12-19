import ListingItem from "@/components/host/listingItem";
import useMyListings from "@/hooks/host/useMyListings";
import RntButton from "@/components/common/rntButton";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import RntSuspense from "@/components/common/rntSuspense";

export default function Listings() {
  const [isLoadingMyListings, myListings] = useMyListings();
  const router = useRouter();
  const { t } = useTranslation();

  const handleAddListing = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await router.push("/host/vehicles/add");
  };
  return (
    <>
      <div id="page-title" className="flex flex-row items-center justify-between">
        <div className="pl-5 text-2xl">
          <strong>{t("vehicles.listing_title")}</strong>
        </div>
        <RntButton className="h-12 w-40 sm:h-16 sm:w-56" onClick={handleAddListing}>
          {t("vehicles.add_listing")}
        </RntButton>
      </div>

      <CheckingLoadingAuth>
        <RntSuspense isLoading={isLoadingMyListings}>
          <div className="my-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            {myListings != null && myListings.length > 0 ? (
              myListings.map((value) => {
                return <ListingItem key={value.carId} carInfo={value} t={t} />;
              })
            ) : (
              <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
                {t("vehicles.no_listed_cars")}
              </div>
            )}
          </div>
        </RntSuspense>
      </CheckingLoadingAuth>
    </>
  );
}

import Layout from "@/components/layout/layout";
import ListingItem from "@/components/host/listingItem";
import PageTitle from "@/components/pageTitle/pageTitle";
import useMyListings from "@/hooks/host/useMyListings";
import Link from "next/link";
import RntButton from "@/components/common/rntButton";
import {verifyCar} from "@/model/HostCarInfo";
import {router} from "next/client";
import {isEmpty} from "@/utils/string";
import {useUserInfo} from "@/contexts/userInfoContext";
import {useRntDialogs} from "@/contexts/rntDialogsContext";

export default function Listings() {
    const [isLoading, myListings] = useMyListings();
    const userInfo = useUserInfo();
    const { showInfo, showError, showDialog, hideDialogs } = useRntDialogs();

    const handleAddListing = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (isEmpty(userInfo?.drivingLicense)) {
            showError("In order to add a car, please enter user information");
            await router.push("/host/profile");
            return;
        }
        await router.push("/host/vehicles/add");
    };

  return (
    <Layout>
      <div className="flex flex-col">
          <div id="page-title" className="flex flex-row justify-between items-center">
              <div className="text-2xl">
                  <strong>Listings</strong>
              </div>
              <RntButton className="w-40 sm:w-56 h-12 sm:h-16" onClick={handleAddListing}>
                  Add Listing
              </RntButton>
          </div>
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

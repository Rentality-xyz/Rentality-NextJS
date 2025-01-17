import ListingItem from "@/components/host/listingItem";
import useMyListings from "@/hooks/host/useMyListings";
import RntButton from "@/components/common/rntButton";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import RntSuspense from "@/components/common/rntSuspense";
import {
  initializeDimoSDK,
  LoginWithDimo,
  ShareVehiclesWithDimo,
  useDimoAuthState,
} from "@dimo-network/login-with-dimo";
import React, { useEffect, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { useUserInfo } from "@/contexts/userInfoContext";
import axios from "@/utils/cachedAxios";
import { DimoCarResponse } from "@/pages/host/dimo";
import { CheckboxLight } from "@/components/common/rntCheckbox";

function Listings() {
  const [isLoadingMyListings, myListings] = useMyListings();
  const router = useRouter();
  const { t } = useTranslation();

  const handleAddListing = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await router.push("/host/vehicles/add");
  };

  //DIMO
  const [isOnlyDimoCar, setIsOnlyDimoCar] = useState<boolean>(false);
  const { isAuthenticated, getValidJWT, walletAddress } = useDimoAuthState();
  const [jwt, setJwt] = useState<string | null>(null);
  const userInfo = useUserInfo();
  const { rentalityContracts } = useRentality();
  const [isLoading, setIsLoading] = useState(true);
  const [dimoVehicles, setDimoVehicles] = useState<DimoCarResponse[]>([]);

  const clientId = process.env.NEXT_PUBLIC_SERVER_DIMO_CLIENT_ID;
  const apiKey = process.env.NEXT_PUBLIC_SERVER_DIMO_API_KEY;
  const domain = process.env.NEXT_PUBLIC_SERVER_DIMO_DOMAIN;

  useEffect(() => {
    if (isAuthenticated) {
      setJwt(getValidJWT());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (walletAddress) {
      fetchDimoData();
    }
  }, [walletAddress, userInfo]);

  if (!clientId || !apiKey || !domain) {
    console.error("DIMO .env is not set");
    return <div>{"dimo env not set"}</div>;
  }

  initializeDimoSDK({
    clientId,
    redirectUri: domain,
    apiKey,
  });

  const fetchDimoData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/dimo/dimo", {
        params: {
          user: walletAddress,
        },
      });

      setDimoVehicles(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data from DIMO API:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <div id="page-title" className="flex items-center justify-start gap-4 max-md:flex-col">
        <div className="flex items-center gap-16 max-md:w-full max-md:justify-between">
          <div className="text-2xl md:pl-5">
            <strong>{t("vehicles.listing_title")}</strong>
          </div>
          <RntButton className="h-12 w-40 sm:w-56" onClick={handleAddListing}>
            {t("vehicles.add_listing")}
          </RntButton>
        </div>
        <div className="flex w-full items-center max-md:mt-2 max-md:justify-between md:gap-4">
          {isAuthenticated ? (
            <ShareVehiclesWithDimo
              mode="popup"
              onSuccess={(authData) => console.log("Success:", authData)}
              onError={(error) => console.error("Error:", error)}
              permissionTemplateId={"1"}
            />
          ) : (
            <LoginWithDimo
              mode="popup"
              onSuccess={(authData) => console.log("Success:", authData)}
              onError={(error) => console.error("Error:", error)}
              permissionTemplateId={"1"}
            />
          )}
          <CheckboxLight
            label="Only DIMO car"
            checked={isOnlyDimoCar}
            onChange={() => {
              setIsOnlyDimoCar(!isOnlyDimoCar);
            }}
          />
        </div>
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

export default Listings;

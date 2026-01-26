import ListingItem from "@/components/host/listingItem";
import RntButton from "@/components/common/rntButton";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import RntSuspense from "@/components/common/rntSuspense";
import { initializeDimoSDK, LoginWithDimo, ShareVehiclesWithDimo } from "@dimo-network/login-with-dimo";
import React, { useEffect, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { CheckboxLight } from "@/components/common/rntCheckbox";
import useDimo from "@/features/dimo/hooks/useDimo";
import { getIpfsURI } from "@/utils/ipfsUtils";
import { env } from "@/utils/env";
import useFetchMyListings from "@/hooks/host/useFetchMyListings";
import { logger } from "@/utils/logger";

function Listings() {
  const { isLoading: isLoadingMyListings, data: myListings } = useFetchMyListings();
  const router = useRouter();
  const { t } = useTranslation();

  const handleAddListing = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await router.push("/host/vehicles/listings/add");
  };

  //DIMO
  const [isShowOnlyDimoCar, setIsShowOnlyDimoCar] = useState<boolean>(false);
  const {
    isLoadingDimo,
    walletAddress,
    isAuthenticated,
    fetchDimoData,
    createRentalityCar,
    onRentalityAndDimoNotSyncMapped,
    onDimoOnly,
    onRentalityAndDimoSync,
  } = useDimo(myListings);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchDimoData();
  }, [walletAddress, isAuthenticated, fetchDimoData]);

  const { rentalityContracts } = useRentality();

  const clientId = env.NEXT_PUBLIC_SERVER_DIMO_CLIENT_ID;
  const apiKey = env.NEXT_PUBLIC_SERVER_DIMO_API_KEY;
  const domain = env.NEXT_PUBLIC_SERVER_DIMO_DOMAIN;

  if (!clientId || !apiKey || !domain) {
    logger.error("DIMO .env is not set");
    return <div>{"server env not set"}</div>;
  }

  initializeDimoSDK({
    clientId,
    redirectUri: domain,
    apiKey,
  });

  const handleSaveDimoTokens = async (dimoTokens: number[], carIds: number[]) => {
    if (!rentalityContracts) {
      logger.error("Save server tokens id error: Rentality contract is null");
      return;
    }
    await rentalityContracts.gateway.saveDimoTokenIds(
      dimoTokens.map((n) => BigInt(n)),
      carIds.map((n) => BigInt(n))
    );
    logger.info("Dimo tokens saved!");
  };

  const combinedListings = [
    ...(myListings || []),
    ...(onDimoOnly || []).map((dimoCar) => ({
      carId: dimoCar.definition.id,
      ownerAddress: "",
      image: getIpfsURI(dimoCar.imageURI),
      brand: dimoCar.definition.make,
      model: dimoCar.definition.model,
      year: dimoCar.definition.year,
      licensePlate: "",
      pricePerDay: 0,
      securityDeposit: 0,
      milesIncludedPerDay: 0,
      currentlyListed: false,
      isEditable: false,
      vinNumber: dimoCar.vin,
      dimoTokenId: dimoCar.tokenId,
    })),
  ];

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
        <div className="flex w-full items-center max-md:mt-2 max-md:flex-col md:gap-4">
          {isAuthenticated ? (
            <ShareVehiclesWithDimo
              mode="popup"
              onSuccess={(authData) => logger.info("Success:", authData)}
              onError={(error) => logger.error("Error:", error)}
              permissionTemplateId={"1"}
            />
          ) : (
            <LoginWithDimo
              mode="popup"
              onSuccess={(authData) => logger.info("Success:", authData)}
              onError={(error) => logger.error("Error:", error)}
              permissionTemplateId={"1"}
            />
          )}
          <CheckboxLight
            className="max-md:mb-3 max-md:mt-4"
            label="Only DIMO car"
            checked={isShowOnlyDimoCar}
            onChange={() => {
              setIsShowOnlyDimoCar(!isShowOnlyDimoCar);
            }}
          />
        </div>
      </div>

      <RntSuspense isLoading={isLoadingMyListings || (isLoadingDimo && isAuthenticated)}>
        <div className="my-4 grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3 min-[1660px]:grid-cols-4">
          {combinedListings.length === 0 && (
            <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
              {t("vehicles.no_listed_cars")}
            </div>
          )}

          {combinedListings.length > 0 &&
            combinedListings.map((value) => {
              const vehicle = onDimoOnly?.find((car) => car.vin === value.vinNumber);
              const carForSync = onRentalityAndDimoNotSyncMapped?.find((car) => car.carId === value.carId);
              const isDimoOnly = onDimoOnly?.some((car) => car.vin === value.vinNumber);
              const isDimoNotSyncMapped = onRentalityAndDimoNotSyncMapped?.some((car) => car.carId === value.carId);
              const isDimoSynced = onRentalityAndDimoSync?.some((car) => car.carId === value.carId);

              return isShowOnlyDimoCar && (isDimoOnly || isDimoSynced || isDimoNotSyncMapped) ? (
                <ListingItem
                  key={value.carId}
                  carInfo={value}
                  isDimoOnly={isDimoOnly && isAuthenticated}
                  isDimoSynced={isDimoSynced && isAuthenticated}
                  isDimoNotSyncMapped={isDimoNotSyncMapped && isAuthenticated}
                  onCreateRentalityCar={() => {
                    if (vehicle) {
                      createRentalityCar(vehicle);
                    }
                  }}
                  onSyncWithDimo={async () => {
                    if (carForSync) {
                      await handleSaveDimoTokens([carForSync.dimoTokenId], [carForSync.carId]);
                    }
                  }}
                  t={t}
                />
              ) : (
                !isShowOnlyDimoCar && (
                  <ListingItem
                    key={value.carId}
                    carInfo={value}
                    isDimoOnly={isDimoOnly && isAuthenticated}
                    isDimoSynced={isDimoSynced && isAuthenticated}
                    isDimoNotSyncMapped={isDimoNotSyncMapped && isAuthenticated}
                    onCreateRentalityCar={() => {
                      if (vehicle) {
                        createRentalityCar(vehicle);
                      }
                    }}
                    onSyncWithDimo={async () => {
                      if (carForSync) {
                        await handleSaveDimoTokens([carForSync.dimoTokenId], [carForSync.carId]);
                      }
                    }}
                    t={t}
                  />
                )
              );
            })}
        </div>
      </RntSuspense>
    </>
  );
}

export default Listings;

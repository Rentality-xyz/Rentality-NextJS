import { LoginWithDimo, ShareVehiclesWithDimo, initializeDimoSDK } from "@dimo-network/login-with-dimo";
import { useDimoAuthState } from "@dimo-network/login-with-dimo";
import { useEffect, useState } from "react";
import axios from "@/utils/cachedAxios";
import { t } from "i18next";
import useMyListings from "@/hooks/host/useMyListings";
import RntButton from "@/components/common/rntButton";
import { useRouter } from "next/router";
import { useUserInfo } from "@/contexts/userInfoContext";
import { useRentality } from "@/contexts/rentalityContext";
import DimoListingItem from "@/components/host/dimoListItem";
import RentalityCarItem from "@/components/host/rentalityCarItem";

export type DimoCarResponse = {
  definition: DimoCar;
  tokenId: number;
  vin: string;
  imageURI: string;
};
export type DimoCarResponseWithTimestamp = {
  definition: DimoCar;
  tokenId: number;
  vin: string;
  timestamp: number;
};
type DimoCar = {
  make: string;
  year: string;
  id: number;
  model: string;
};

type Car = {
  model: string;
  brand: string;
  image: string;
  dimoTokenId: number;
  carId: number;
  isSynced: boolean;
};
export default function Dimo() {
  /// wallets for testing, unncomment wallet address from useDimoAuthState
  const walletAddress = "0xCAA591fA19a86762D1ed1B98b2057Ee233240b65";
  // const walletAddress = '0xFD04ca16023A51beA99c750B3391F3CFd156d6c4' //17

  const { isAuthenticated, getValidJWT /*walletAddress*/ } = useDimoAuthState();
  const [jwt, setJwt] = useState<string | null>(null);
  const [dimoVehicles, setDimoVehicles] = useState<DimoCarResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // const [isLoadingMyListings, myListings] = useMyListings(); TODO
  const myListings = [
    {
      carId: 1,
      ownerAddress: "0x1234567890abcdef1234567890abcdef12345678",
      image: "https://example.com/car1.jpg",
      brand: "Tesla",
      model: "Model S",
      year: "2023",
      licensePlate: "ABC123",
      pricePerDay: 150,
      securityDeposit: 1000,
      milesIncludedPerDay: 200,
      currentlyListed: true,
      isEditable: true,
      vinNumber: "5YJSA1E26HF123456",
      dimoTokenId: 0,
    },
    {
      carId: 2,
      ownerAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
      image: "https://example.com/car2.jpg",
      brand: "BMW",
      model: "X5",
      year: "2022",
      licensePlate: "XYZ987",
      pricePerDay: 120,
      securityDeposit: 800,
      milesIncludedPerDay: 150,
      currentlyListed: false,
      isEditable: false,
      vinNumber: "WBA5A7C57ED123456",
      dimoTokenId: 0,
    },
  ];

  const userInfo = useUserInfo();
  const router = useRouter();
  const { rentalityContracts } = useRentality();

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

  const createRentalityCar = (car: DimoCarResponse) => {
    localStorage.setItem("dimo", JSON.stringify({ ...car, timestamp: new Date().getTime() }));
    router.push("/host/vehicles/add");
  };
  const handleJWT = async () => {
    try {
      const response = await axios.get("/api/dimo/dimo", {
        params: {
          user: walletAddress,
        },
      });
    } catch (error) {
      console.error("Error fetching data from DIMO API:", error);
    }
  };

  // Function to fetch Dimo data based on the wallet address
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

  let onRentalityAndDimoNotSync;
  let onRentalityAndDimoNotSyncMapped: Car[] = [];
  let onDimoOnly;
  let onRentalityAndDimoSync;
  if (myListings && dimoVehicles) {
    onRentalityAndDimoNotSync = myListings
      .filter(
        (car) => BigInt(car.dimoTokenId) === BigInt(0) && dimoVehicles.some((dimoCar) => dimoCar.vin === car.vinNumber)
      )
      .map((car) => {
        const matchedDimoCar = dimoVehicles.find((dimoCar) => dimoCar.vin === car.vinNumber);
        return {
          ...car,
          dimoTokenId: matchedDimoCar ? matchedDimoCar.tokenId : car.dimoTokenId,
        };
      });
    onRentalityAndDimoNotSyncMapped = onRentalityAndDimoNotSync
      ? onRentalityAndDimoNotSync.map((car) => {
          return {
            model: car.model,
            brand: car.brand,
            image: car.image,
            dimoTokenId: car.dimoTokenId,
            carId: car.carId,
            isSynced: false,
          };
        })
      : [];

    onRentalityAndDimoSync = myListings
      .filter((car) => dimoVehicles.some((dimoCar) => BigInt(dimoCar.tokenId) === BigInt(car.dimoTokenId)))
      .map((car) => {
        return {
          model: car.model,
          brand: car.brand,
          image: car.image,
          dimoTokenId: car.dimoTokenId,
          carId: car.carId,
          isSynced: true,
        };
      });

    onDimoOnly = dimoVehicles.filter(
      (dimoCar) => myListings.find((car) => car.vinNumber === dimoCar.vin) === undefined
    );
  }
  const handleSaveDimoTokens = async (dimoTokens: number[], carIds: number[]) => {
    if (!rentalityContracts) {
      console.error("Save dimo tokens id error: Rentality contract is null");
      return;
    }
    await rentalityContracts.gateway.saveDimoTokenIds(dimoTokens, carIds);
    console.log("Dimo tokens saved!");
  };
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "1rem" }}>
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
      </div>

      <div className="my-4">
        {onDimoOnly && onDimoOnly.length > 0 && (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {onDimoOnly.map((vehicle) => (
              <DimoListingItem
                key={vehicle.tokenId}
                carInfo={vehicle}
                t={t}
                onCreateRentalityCar={() => createRentalityCar(vehicle)}
              />
            ))}
          </div>
        )}
      </div>

      {onRentalityAndDimoNotSyncMapped && onRentalityAndDimoNotSyncMapped.length > 0 && (
        <div className="my-4">
          <label>On Dimo and on Rentality and not sync</label>
          <div className="my-2">
            <RntButton
              onClick={async () => {
                await handleSaveDimoTokens(
                  onRentalityAndDimoNotSyncMapped.map((c: { dimoTokenId: number }) => c.dimoTokenId),
                  onRentalityAndDimoNotSyncMapped.map((c: { carId: number }) => c.carId)
                );
              }}
            >
              Sync DIMO with Rentality cars
            </RntButton>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {onRentalityAndDimoNotSyncMapped.map((rentalityCar) => (
              <RentalityCarItem key={rentalityCar.carId} carInfo={rentalityCar} t={t} />
            ))}
          </div>
        </div>
      )}

      {onRentalityAndDimoSync && onRentalityAndDimoSync.length > 0 && (
        <div className="my-4">
          <label>Already sync</label>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {onRentalityAndDimoSync.map((rentalityCar) => (
              <RentalityCarItem key={rentalityCar.carId} carInfo={rentalityCar} t={t} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

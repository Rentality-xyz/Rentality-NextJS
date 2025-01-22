import { useState, useEffect } from "react";
import { useDimoAuthState } from "@dimo-network/login-with-dimo";
import axios from "@/utils/cachedAxios";
import { useRouter } from "next/router";

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

export type Car = {
  model: string;
  brand: string;
  image: string;
  dimoTokenId: number;
  carId: number;
  isSynced: boolean;
};

interface UseDimoReturn {
  walletAddress: string;
  isLoadingDimo: boolean;
  dimoVehicles: DimoCarResponse[];
  isAuthenticated: boolean;
  jwt: string | null;
  fetchDimoData: () => Promise<void>;
  createRentalityCar: (car: DimoCarResponse) => void;
  onRentalityAndDimoNotSyncMapped: Car[];
  onDimoOnly: DimoCarResponse[];
  onRentalityAndDimoSync: Car[];
}

const useDimo = (myListings: any[]): UseDimoReturn => {
  const walletAddress = "0xCAA591fA19a86762D1ed1B98b2057Ee233240b65";
  const { isAuthenticated, getValidJWT /*walletAddress*/ } = useDimoAuthState();
  const [jwt, setJwt] = useState<string | null>(null);
  const [isLoadingDimo, setIsLoadingDimo] = useState(true);
  const [dimoVehicles, setDimoVehicles] = useState<DimoCarResponse[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      setJwt(getValidJWT());
    }
  }, [isAuthenticated]);

  // Function to fetch Dimo data based on the wallet address
  const fetchDimoData = async () => {
    try {
      setIsLoadingDimo(true);
      const response = await axios.get("/api/dimo/dimo", {
        params: {
          user: walletAddress,
        },
      });

      setDimoVehicles(response.data);
      setIsLoadingDimo(false);
    } catch (error) {
      console.error("Error fetching data from DIMO API:", error);
      setIsLoadingDimo(false);
    }
  };

  const createRentalityCar = (car: DimoCarResponse) => {
    localStorage.setItem("dimo", JSON.stringify({ ...car, timestamp: new Date().getTime() }));
    router.push("/host/vehicles/add");
  };

  let onRentalityAndDimoNotSync = [];
  let onRentalityAndDimoNotSyncMapped: Car[] = [];
  let onDimoOnly: any[] = [];
  let onRentalityAndDimoSync: any[] = [];

  if (myListings && dimoVehicles) {
    onRentalityAndDimoNotSync = myListings
      .filter(
        (car) =>
          (car.dimoTokenId === undefined || BigInt(car.dimoTokenId) === BigInt(0)) &&
          dimoVehicles.some((dimoCar) => dimoCar.vin === car.vinNumber)
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
      .filter(
        (car) =>
          car.dimoTokenId !== undefined &&
          dimoVehicles.some((dimoCar) => BigInt(dimoCar.tokenId) === BigInt(car.dimoTokenId))
      )
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

  return {
    walletAddress: walletAddress,
    isLoadingDimo: isLoadingDimo,
    dimoVehicles,
    isAuthenticated,
    jwt,
    fetchDimoData,
    createRentalityCar,
    onRentalityAndDimoNotSyncMapped,
    onDimoOnly,
    onRentalityAndDimoSync,
  };
};

export default useDimo;

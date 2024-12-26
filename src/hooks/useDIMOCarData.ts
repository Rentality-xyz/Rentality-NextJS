import { useRentality } from "@/contexts/rentalityContext";
import { EngineType } from "@/model/blockchain/schemas";
import axios from "axios";
import { useEffect, useState } from "react";

type DimoPanelData = {
  fuelLevel: string | null;
  odometer: number; 
};

function calculateFuelPercentage(tankCapacityGallons: number, fuelLiters: number | null): string | null {
  if (fuelLiters === null) return null;

  const tankCapacityLiters = tankCapacityGallons * 3.78541;
  if (tankCapacityLiters === 0) return "0";

  const fuelPercentage = (fuelLiters / tankCapacityLiters) * 100;
  return fuelPercentage.toFixed(0);
}

const useDIMOCarData = (carId: number) => {
  const rentalityContract = useRentality();
  const [panelData, setPanelData] = useState<DimoPanelData | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const params = await getCarPanelParams(carId);
      if (params !== null) setPanelData(params);
    };
    getParams();
  }, [carId]);

  const getCarPanelParams = async (carId: number): Promise<DimoPanelData | null> => {
    if (!rentalityContract) {
      console.error("Get DIMO panel params data error: Rentality contract is null");
      return null;
    }

    try {
      const carDetails = await rentalityContract.getCarDetails(BigInt(carId));

      if (carDetails.dimoTokenId === 0) {
        return null
      }

      const panelParams = await axios.get("/api/dimo/dimoSignals", {
        params: { tokenId: carDetails.dimoTokenId },
      });

      if (panelParams.data) {
        const panelResult = panelParams.data;

        if (carDetails.engineType === EngineType.ELECTRIC) {
          return {
            odometer: panelResult.odometr || 0,
            fuelLevel: calculateFuelPercentage(Number(carDetails.engineParams[0]), panelResult.fuelLevel),
          };
        } else {
          return {
            odometer: panelResult.odometr || 0,
            fuelLevel: panelResult.battery ? panelResult.battery.toFixed(0) : null,
          };
        }
      } else {
        console.error("Fail to get panel data from DIMO");
        return null;
      }
    } catch (error) {
      console.error("Fail to get panel data from DIMO: ", error);
      return null;
    }
  };

  return { panelData };
};

export default useDIMOCarData;

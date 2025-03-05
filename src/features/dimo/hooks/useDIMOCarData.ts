import { useRentality } from "@/contexts/rentalityContext";
import { EngineType } from "@/model/blockchain/schemas";
import axios from "axios";
import { useEffect, useState } from "react";

type DimoPanelData = {
  fuelOrBatteryLevel: number;
  odotemer: number;
};
const EmptyDimoPanelData: DimoPanelData = {
  fuelOrBatteryLevel: 0,
  odotemer: 0,
};

function calculateFuelPercentage(tankCapacityGallons: number, fuelLiters: number): string {
  const tankCapacityLiters = tankCapacityGallons * 3.78541;
  if (tankCapacityLiters === 0) return "0";

  const fuelPercentage = (fuelLiters / tankCapacityLiters) * 100;
  return fuelPercentage.toFixed(0);
}
function roundToNearestTen(num: number) {
  return Math.round(num / 10) * 10;
}

const useDIMOCarData = (carId: number) => {
  const { rentalityContracts } = useRentality();
  const [panelData, setPanelData] = useState<DimoPanelData>(EmptyDimoPanelData);

  useEffect(() => {
    const getParams = async () => {
      const params = await getCarPanelParams(carId);
      if (params !== EmptyDimoPanelData) setPanelData(params);
    };
    getParams();
  }, [carId]);

  const getCarPanelParams = async (carId: number): Promise<DimoPanelData> => {
    if (!rentalityContracts) {
      console.error("Get DIMO panel params data error: Rentality contract is null");
      return EmptyDimoPanelData;
    }

    try {
      const result = await rentalityContracts.gateway.getCarDetails(BigInt(carId));

      if (!result.ok || result.value.dimoTokenId === BigInt(0)) {
        return EmptyDimoPanelData;
      }

      const carDetails = result.value;
      const panelParams = await axios.get("/api/dimo/dimoSignals", {
        params: { tokenId: carDetails.dimoTokenId },
      });

      if (panelParams.data) {
        const panelResult = panelParams.data;

        if (carDetails.engineType !== EngineType.ELECTRIC) {
          return {
            odotemer: Number.parseInt(panelResult.odometr.toFixed(0)) || 0,
            fuelOrBatteryLevel: panelResult.fuelLevel
              ? Number.parseInt(
                  calculateFuelPercentage(Number(carDetails.engineParams[0]), panelResult.fuelLevel.value)
                )
              : 0,
          };
        } else {
          return {
            odotemer: Number.parseInt(panelResult.odometr.toFixed(0)) || 0,
            fuelOrBatteryLevel: panelResult.fuelLevel ? roundToNearestTen(panelResult.fuelLevel.value) : 0,
          };
        }
      } else {
        console.error("Fail to get panel data from DIMO");
        return EmptyDimoPanelData;
      }
    } catch (error) {
      console.error("Fail to get panel data from DIMO: ", error);
      return EmptyDimoPanelData;
    }
  };

  return { panelData, getCarPanelParams };
};

export default useDIMOCarData;

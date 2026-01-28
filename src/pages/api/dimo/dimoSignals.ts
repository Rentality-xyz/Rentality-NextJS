import { NextApiRequest, NextApiResponse } from "next";
import { authOnDimo, tokenExchange } from "@/server/dimo/helpers";

function kmToMiles(km: number) {
  const miles = km * 0.621371;
  return miles;
}
type PanelData = {
  data: {
    signalsLatest: {
      lastSeen: string;
      powertrainTransmissionTravelledDistance: {
        value: number;
      } | null;
      powertrainFuelSystemRelativeLevel: {
        value: number;
      } | null;
      powertrainFuelSystemSupportedFuelTypes: any | null;
      powertrainTractionBatteryStateOfChargeCurrent: {
        value: number;
      } | null;
    };
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tokenId = <string>req.query.tokenId;
  const id = Number.parseInt(tokenId);

  const authResult = await authOnDimo();

  if (authResult === null) return;

  const { auth, dimo } = authResult;

  const privToken = await tokenExchange(id, auth, dimo, [1, 2, 3, 4, 5]);

  const panelData = await dimo.telemetry.query({
    ...privToken,
    query: `
                query { signalsLatest(tokenId: ${id}) {
                        lastSeen
                        powertrainTransmissionTravelledDistance { value }
                        powertrainFuelSystemRelativeLevel { value }
                        powertrainTractionBatteryStateOfChargeCurrent {value }
                    }
                }
            `,
  });
  const parsedResult = panelData as unknown as PanelData;
  const distanceInMiles = parsedResult.data.signalsLatest.powertrainTransmissionTravelledDistance
    ? kmToMiles(parsedResult.data.signalsLatest.powertrainTransmissionTravelledDistance.value)
    : 0;

  const battery = parsedResult.data.signalsLatest.powertrainTractionBatteryStateOfChargeCurrent;
  const fuelLevel = parsedResult.data.signalsLatest.powertrainFuelSystemRelativeLevel;
  return res.json({
    odometr: distanceInMiles,
    fuelLevel,
    battery,
  });
}

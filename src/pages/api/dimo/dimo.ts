
import { NextApiRequest, NextApiResponse } from "next";
import { authOnDimo, tokenExchange } from "./helpers";

type DIMOSharedCarsResponse = {
  data: {
    vehicles: {
      nodes: [{
    tokenId: number;
    definition: {
      make: string;
      model: string;
      year: number
  }
}]
}
  }
}

type VCDimoResult = {
        message: string;
        vcQuery: string;
        vcUrl: string;
    }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = <string>req.query.user!

  const authResult = await authOnDimo()
  if(authResult === null)
    return

  const {auth, dimo, clientId} = authResult

  const userCarsOnDimo = await dimo.identity.query({
    query: `
    {
      vehicles(filterBy: {privileged: "${clientId}", owner: "${user}"}, first: 100) {
        totalCount
        nodes {
          tokenId
          definition {
            make
            model
            year,
            id
          }
        }
      }
    }`
  });
  const result = await Promise.all((userCarsOnDimo as unknown as DIMOSharedCarsResponse).data.vehicles.nodes.map(async (token) => {
      const id = token.tokenId;


  const privToken = await tokenExchange(id, auth, dimo, [1, 2, 3, 4, 5])
  const getVinByTokenId = async (id: number): Promise<string | null> => {
    try {
    const vinResponse = await dimo.telemetry.query({
      ...privToken,
      query: `
        query VIN {
          vinVCLatest(tokenId: ${id}) {
            vin
          }
        }
      `,
    });
    return (vinResponse as unknown as {data: {vinVCLatest: { vin: string | null}}}).data.vinVCLatest.vin
  }
  
  catch (error) {
    console.error("Fail to get VIN on DIMO: ", error)
    return null
  }
  }
   
  let vin = await getVinByTokenId(id)

  if(vin === null) {
    try {
    await dimo.attestation.createVinVC({
      ...privToken,
      tokenId: id
    }); 
    vin = await getVinByTokenId(id)
  }
  catch(error) {
    console.error("Fail to create vinVC on DIMO: ", error)
    return null
  }
    
  }
    return {
      ...token,
      vin
    }
  }))

    return res.json(result)

}

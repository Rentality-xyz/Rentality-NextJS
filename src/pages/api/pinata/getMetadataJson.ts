import { getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { tokenURI } = req.query;
    if (tokenURI === undefined || Array.isArray(tokenURI)) {
      res.status(404).json({});
      return;
    }
    //console.log("getMetadataJson: tokenURI:", tokenURI);
    //const { tokenURI } = req.body;
    // const result = await fetch(tokenURI, {
    //   headers: {
    //     Accept: "application/json",
    //   },
      
    // });
    // const meta = await result.json();
    const meta = await getMetaDataFromIpfs(tokenURI);
    res.status(200).json({ ...meta });
  } catch (err) {
    console.error("getMetadataJson handler error: ", err);
    res.status(500).json({ error: "failed to load data" });
  }
}

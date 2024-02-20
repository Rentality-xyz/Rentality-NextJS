import { isEmpty } from "./string";

export const getIpfsURIfromPinata = (pinataURI: string) => {
  if (isEmpty(pinataURI)) return "";
  return "https://ipfs.io/ipfs/" + pinataURI.split("/").pop();
};

export const getPinataGatewayURIfromPinata = (pinataURI: string) => {
  if (isEmpty(pinataURI)) return "";
  return "https://ivory-specific-mink-961.mypinata.cloud/ipfs/" + pinataURI.split("/").pop();
};

export const getMetaDataFromIpfs = async (tokenURI: string) => {
  //var ipfsURI = getPinataGatewayURIfromPinata(tokenURI);
  var ipfsURI = getIpfsURIfromPinata(tokenURI);
  try {
    const response = await fetch(ipfsURI, {
      headers: {
        Accept: "application/json",
      },
    });
    return await response.json();
  } catch (ex) {
    console.error("load metadata from pinata gateway error:", ex);

    ipfsURI = getIpfsURIfromPinata(tokenURI);
    try {
      console.log("try fetch " + ipfsURI);

      const response = await fetch(ipfsURI, {
        headers: {
          Accept: "application/json",
        },
      });
      return await response.json();
    } catch (ex) {
      console.error("load metadata from IPFS error:", ex);
    }
  }
  return {};
};

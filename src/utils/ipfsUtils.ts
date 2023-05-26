export const getIpfsURIfromPinata =  (pinataURI:string) => {
    return "https://ipfs.io/ipfs/" + pinataURI.split("/").pop();
}
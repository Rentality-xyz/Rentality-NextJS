import { SearchCarInfo } from "@/model/SearchCarInfo";
import Image from "next/image";

type Props = {
  searchInfo: SearchCarInfo;
  sendRentCarRequest:(carInfo: SearchCarInfo) => void
};

export default function CarSearchItem({ searchInfo, sendRentCarRequest }: Props) {
  
  // const sendRentCarRequest = async (tokenId) => {
  //   try {
  //     const ethers = require("ethers");
  //     //After adding your Hardhat network to your metamask, this code will get providers and signers
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner();

  //     //Pull the deployed contract instance
  //     let contract = new ethers.Contract(
  //       RentCarJSON.address,
  //       RentCarJSON.abi,
  //       signer
  //     );

  //     const rentPriceInUsdCents = (totalPrice * 100) | 0;
  //     const rentPriceInEth = await contract.getEthFromUsd(rentPriceInUsdCents);

  //     setMessage("Renting the car... Please Wait (Upto 5 mins)");
  //     rentCarButtonRef.current.disabled = true;
  //     //run the executeSale function
  //     let transaction = await contract.rentCar(tokenId, daysToRent, {
  //       value: rentPriceInEth,
  //     });
  //     await transaction.wait();

  //     alert("You successfully send request to rent this car!");
  //     setMessage("");
  //     window.location.replace("/");
  //   } catch (e) {
  //     alert("Upload Error" + e);
  //     rentCarButtonRef.current.disabled = false;
  //   }
  // };

  return (
    <div className="flex flex-row rounded-xl bg-pink-100">
      <div className="h-56 w-60 flex-shrink-0 rounded-l-xl bg-slate-400">
        <Image src={searchInfo.image} alt="" width={1000} height={1000} className="h-full w-full rounded-lg object-cover" />
        {/* <img
          src={searchInfo.image}
          alt=""
          className="h-full w-full rounded-lg object-cover"
        /> */}
      </div>
      <div className="w-full flex flex-col justify-between p-4">
        <div className="flex flex-row justify-between items-baseline">
          <div>
            <strong className="text-xl">{`${searchInfo.brand} ${searchInfo.model} ${searchInfo.year}`}</strong>
          </div>
          <div>{searchInfo.licensePlate}</div>
        </div>
        <div className="flex flex-row justify-between items-end">
          <div className="flex flex-col">
            <strong className="text-xl">{`$${searchInfo.pricePerDay}/day`}</strong>
            <div className="text-sm">{`$${searchInfo.totalPrice} est. total`}</div>
          </div>
          <button className="px-4 w-44 h-12 bg-violet-700 rounded-md" onClick={() => sendRentCarRequest(searchInfo)}>
            Rent for {searchInfo.days} day(s)
          </button>
        </div>
      </div>
    </div>
  );
}

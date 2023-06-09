import { SearchCarInfo } from "@/model/SearchCarInfo";
import Image from "next/image";

type Props = {
  searchInfo: SearchCarInfo;
  sendRentCarRequest: (carInfo: SearchCarInfo) => void;
};

export default function CarSearchItem({
  searchInfo,
  sendRentCarRequest,
}: Props) {
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
      <div className="flex w-full flex-col justify-between p-4">
        <div className="flex flex-row items-baseline justify-between">
          <div>
            <strong className="text-xl">{`${searchInfo.brand} ${searchInfo.model} ${searchInfo.year}`}</strong>
          </div>
          <div>{searchInfo.licensePlate}</div>
        </div>
        <div className="grid grid-cols-2">
          <div className="flex flex-col">
            <div>- {searchInfo.fuelType}</div>
            <div>- {searchInfo.transmission}</div>
          </div>
          <div className="flex flex-col">
            <div>- {searchInfo.seatsNumber} seats</div>
            <div>- {searchInfo.distanceIncludedInMi} mi included</div>
          </div>
        </div>
        <div className="flex flex-row items-end justify-between">
          <div className="flex flex-col">
            <strong className="text-xl">{`$${searchInfo.pricePerDay}/day`}</strong>
            <div className="text-sm">{`+ $${searchInfo.deposit} deposit`}</div>
          </div>
          <button
            className="h-12 w-44 rounded-md bg-violet-700 px-4"
            onClick={() => sendRentCarRequest(searchInfo)}
          >
            Rent for {searchInfo.days} day(s) for ${searchInfo.totalPrice + searchInfo.deposit}
          </button>
        </div>
      </div>
    </div>
  );
}

import { BaseCarInfo } from "@/model/BaseCarInfo";
import Image from "next/image";

type Props = {
  carInfo: BaseCarInfo;
  sendRentCarRequest:(carInfo: BaseCarInfo) => void
};

export default function CarSearchItem({ carInfo, sendRentCarRequest }: Props) {
  
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
      <div className="w-60 h-56 bg-slate-400 rounded-l-xl flex-shrink-0">
        {/* <Image src={carInfo.image} alt="" width={240} height={192} className="w-60 h-48 rounded-lg object-cover" /> */}
        <img
          src={carInfo.image}
          alt=""
          className="w-full h-full rounded-lg object-cover"
        />
      </div>
      <div className="w-full flex flex-col justify-between p-4">
        <div className="flex flex-row justify-between items-baseline">
          <div>
            <strong className="text-xl">{`${carInfo.brand} ${carInfo.model} ${carInfo.year}`}</strong>
          </div>
          <div>{carInfo.licensePlate}</div>
        </div>
        <div className="flex flex-row justify-between items-end">
          <div className="flex flex-col">
            <strong className="text-xl">{`$${carInfo.pricePerDay}/day`}</strong>
            <div className="text-sm">{`$${carInfo.pricePerDay} est. total`}</div>
          </div>
          <button className="px-4 w-36 h-12 bg-violet-700 rounded-md" onClick={() => sendRentCarRequest(carInfo)}>
            Rent now
          </button>
        </div>
      </div>
    </div>
  );
}

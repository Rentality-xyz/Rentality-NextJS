import Head from "next/head";
import Image from "next/image";
import logo from "../../images/logo.png";
import Link from "next/link";

export default function TripItem() {
  return (
    <div className="flex flex-row m-4 ml-0 bg-pink-300">
      <div className="w-60 h-48 bg-slate-400">
        {/* <Image src={logo} alt="" /> */}
      </div>
      <div className="flex flex-col">
        <div className="flex flex-col">
          <div>Ford Mustang 2023</div>
          <div>EE 099 TVQ</div>
        </div>
        <div className="flex flex-row">
          <button>Confirm</button>
          <button>Reject</button>
          {/* <button>Chenk-in</button> */}
        </div>
      </div>
      <div className="flex flex-col  mx-4">
        <div className="flex flex-col">
          <div>Trip start</div>
          <div>April 05, 4:00 AM</div>
        </div>
        <div className="flex flex-col">
          <div>Trip end</div>
          <div>April 05, 4:00 AM</div>
        </div>
      </div>
      <div className="flex flex-col mx-4">
        <div className="flex flex-col">
          <div>Pickup location</div>
          <div>Miami, CA, USA</div>
        </div>
        <div className="flex flex-col">
          <div>Return location</div>
          <div>Miami, CA, USA</div>
        </div>
      </div>
    </div>
  );
}

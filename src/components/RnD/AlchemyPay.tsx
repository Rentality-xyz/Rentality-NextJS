import React, { memo } from "react";
import RntButton from "../common/rntButton";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import crypto from "crypto";

function encrypt(plainText: string, secretKeyData: string) {
  try {
    var hmac = crypto.createHmac("sha1", secretKeyData);
    var signed = hmac.update(Buffer.from(plainText, "utf-8")).digest("base64");
    return signed;
  } catch (e) {
    console.log(`HmacSHA1 encrypting exception, msg is ${e}`);
  }
  return null;
}

function buildLink(address: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_ALCHEMY_LINK!;
  const url = new URL(baseUrl);

  url.searchParams.append("appId", process.env.NEXT_PUBLIC_ALCHEMY_APP_ID!);
  url.searchParams.append("fiat", "USD");
  url.searchParams.append("crypto", "ETH");
  url.searchParams.append("address", address);
  url.searchParams.append("callbackUrl", baseUrl);

  const sign = encrypt(process.env.NEXT_PUBLIC_ALCHEMY_SECRET!, url.toString());
  url.searchParams.append("sign", sign!);

  return url.toString();
}

function AlchemyPay() {
  const ethereumInfo = useEthereum();

  return (
    <div className="flex items-center gap-4">
      <span className="text-lg">Coming soon Alchemy Pay service: </span>
      <RntButton
        className="w-44"
        disabled={true} /* onClick={() => window.open(buildLink(ethereumInfo?.walletAddress ?? ""))} */
      >
        Buy Crypto
      </RntButton>
    </div>
  );
}

export default memo(AlchemyPay);

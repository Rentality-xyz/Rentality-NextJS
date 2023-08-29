import { RentalityProvider } from "@/contexts/rentalityContext";
import { UserInfoProvider } from "@/contexts/userInfoContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <RentalityProvider>
        <UserInfoProvider>
          <Component {...pageProps} />
        </UserInfoProvider>
      </RentalityProvider>
    </>
  );
}

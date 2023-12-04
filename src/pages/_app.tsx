import { CivicControl } from "@/components/CivicControl";
import { RentalityProvider } from "@/contexts/rentalityContext";
import { UserInfoProvider } from "@/contexts/userInfoContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import {AppContextProvider} from "@/contexts/useAppContext";
import {Main} from "next/document";

export default function App({ Component, pageProps }: AppProps) {
  return (
      <>
          <AppContextProvider>
              <RentalityProvider>
                  <UserInfoProvider>
                      <CivicControl>
                          <Component {...pageProps} />
                      </CivicControl>
                  </UserInfoProvider>
              </RentalityProvider>
          </AppContextProvider>
      </>
  );
}

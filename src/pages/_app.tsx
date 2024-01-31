import { AppContextProvider } from "@/contexts/appContext";
import { CivicProvider } from "@/contexts/civicContext";
import { RentalityProvider } from "@/contexts/rentalityContext";
import { UserInfoProvider } from "@/contexts/userInfoContext";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import "@/styles/globals.css";
import { PrivyProvider } from "@/contexts/privyContext";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <PrivyProvider>
      <RentalityProvider>
        <CivicProvider>
          <UserInfoProvider>
            <AppContextProvider>
              <Component {...pageProps} />
            </AppContextProvider>
          </UserInfoProvider>
        </CivicProvider>
      </RentalityProvider>
    </PrivyProvider>
  );
}

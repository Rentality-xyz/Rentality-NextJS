import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Web3Setup } from "@/contexts/web3/web3Setup";
import { UserInfoProvider } from "@/contexts/userInfoContext";
import { ChatProvider } from "@/contexts/chatContext";
import { AppContextProvider } from "@/contexts/appContext";
import { RentalityProvider } from "@/contexts/rentalityContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3Setup>
      <RentalityProvider>
        <UserInfoProvider>
          <ChatProvider>
            <AppContextProvider>
              <Component {...pageProps} />
            </AppContextProvider>
          </ChatProvider>
        </UserInfoProvider>
      </RentalityProvider>
    </Web3Setup>
  );
}

import { AppContextProvider } from "@/contexts/appContext";
import { CivicProvider } from "@/contexts/civicContext";
import { RentalityProvider } from "@/contexts/rentalityContext";
import { UserInfoProvider } from "@/contexts/userInfoContext";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import "@/styles/globals.css";
import { PrivyProvider } from "@/contexts/privyContext";
import { ChatProvider } from "@/contexts/chatContext";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <PrivyProvider>
      <RentalityProvider>
        <CivicProvider>
          <UserInfoProvider>
            <ChatProvider>
              <AppContextProvider>
                <Component {...pageProps} />
              </AppContextProvider>
            </ChatProvider>
          </UserInfoProvider>
        </CivicProvider>
      </RentalityProvider>
    </PrivyProvider>
  );
}

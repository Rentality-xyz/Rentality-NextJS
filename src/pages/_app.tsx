import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Web3Setup } from "@/contexts/web3/web3Setup";
import { UserInfoProvider } from "@/contexts/userInfoContext";
import { ChatProvider } from "@/contexts/chatContext";
import { AppContextProvider } from "@/contexts/appContext";
import { RentalityProvider } from "@/contexts/rentalityContext";
import { RntDialogsProvider } from "@/contexts/rntDialogsContext";
import { NotificationProvider } from "@/contexts/notification/notificationContext";
import { useRouter } from "next/router";
// should be here for downloading 'locales/* '
import "../utils/i18n";
import { useEffect } from "react";
import { analyticsPromise } from "@/utils/firebase";
import { FirebaseChatProvider } from "@/contexts/firebaseChatContext";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isHost = router.route.startsWith("/host");

  useEffect(() => {
    analyticsPromise;
  }, []);

  return (
    <Web3Setup>
      <RentalityProvider>
        <UserInfoProvider>
          <NotificationProvider isHost={isHost}>
            <FirebaseChatProvider>
              <AppContextProvider>
                <RntDialogsProvider>
                  <Component {...pageProps} />
                </RntDialogsProvider>
              </AppContextProvider>
            </FirebaseChatProvider>
          </NotificationProvider>
        </UserInfoProvider>
      </RentalityProvider>
    </Web3Setup>
  );
}

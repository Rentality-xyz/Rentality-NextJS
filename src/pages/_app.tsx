import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Web3Setup } from "@/contexts/web3/web3Setup";
import { UserInfoProvider } from "@/contexts/userInfoContext";
import { WakuChatProvider } from "@/contexts/chat/waku/chatContext";
import { FirebaseChatProvider } from "@/contexts/chat/firebase/chatContext";
import { AppContextProvider } from "@/contexts/appContext";
import { RentalityProvider } from "@/contexts/rentalityContext";
import { RntDialogsProvider } from "@/contexts/rntDialogsContext";
import { NotificationProvider } from "@/contexts/notification/notificationContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { analyticsPromise } from "@/utils/firebase";
// should be here for downloading 'locales/* '
import "../utils/i18n";
import { base } from "viem/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/tailwind.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/wagmi.config";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isHost = router.route.startsWith("/host");
  const queryClient = new QueryClient();

  useEffect(() => {
    analyticsPromise;
  }, []);

  return (
    <Web3Setup>
      <RentalityProvider>
        <UserInfoProvider>
          <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              <OnchainKitProvider apiKey={process.env.NEXT_PUBLIC_COINBASE_API_KEY} chain={base}>
                <NotificationProvider isHost={isHost}>
                  <FirebaseChatProvider>
                    <AppContextProvider>
                      <RntDialogsProvider>
                        <Component {...pageProps} />
                      </RntDialogsProvider>
                    </AppContextProvider>
                  </FirebaseChatProvider>
                </NotificationProvider>
              </OnchainKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </UserInfoProvider>
      </RentalityProvider>
    </Web3Setup>
  );
}

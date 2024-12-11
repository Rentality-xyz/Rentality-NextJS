import "@/styles/globals.css";
import "@coinbase/onchainkit/tailwind.css";
// should be here for downloading 'locales/* '
import "../utils/i18n";
import type { AppProps } from "next/app";
import { Web3Setup } from "@/contexts/web3/web3Setup";
import { UserInfoProvider } from "@/contexts/userInfoContext";
import { FirebaseChatProvider } from "@/contexts/chat/firebase/chatContext";
import { AppContextProvider } from "@/contexts/appContext";
import { RentalityProvider } from "@/contexts/rentalityContext";
import { RntDialogsProvider } from "@/contexts/rntDialogsContext";
import { NotificationProvider } from "@/contexts/notification/notificationContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { analyticsPromise } from "@/utils/firebase";
import { base } from "viem/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/wagmi.config";
import { env } from "@/utils/env";
import Layout from "@/components/layout/layout";
import { initEruda, initHotjar } from "@/utils/init";
import FacebookPixelScript from "@/components/marketing/FacebookPixelScript";
import PlatformInitChecker from "@/components/common/PlatformInitChecker";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isHost = router.route.startsWith("/host");
  const queryClient = new QueryClient();

  useEffect(() => {
    analyticsPromise;
  }, []);

  useEffect(() => {
    initHotjar();
  }, []);

  useEffect(() => {
    initEruda();
  }, []);

  return (
    <>
      <FacebookPixelScript />
      <Web3Setup>
        <RentalityProvider>
          <UserInfoProvider>
            <WagmiProvider config={wagmiConfig}>
              <QueryClientProvider client={queryClient}>
                {/*
                // @ts-ignore */}
                <OnchainKitProvider apiKey={env.NEXT_PUBLIC_COINBASE_API_KEY} chain={base}>
                  <NotificationProvider isHost={isHost}>
                    <FirebaseChatProvider>
                      <AppContextProvider>
                        <RntDialogsProvider>
                          <PlatformInitChecker>
                            <Layout>
                              <Component {...pageProps} />
                            </Layout>
                          </PlatformInitChecker>
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
    </>
  );
}

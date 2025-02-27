import "@/styles/globals.css";
import "@coinbase/onchainkit/tailwind.css";
// should be here for downloading 'locales/* '
import "../utils/i18n";
import type { AppProps } from "next/app";
import { Web3Setup } from "@/contexts/web3/web3Setup";
import { UserInfoProvider } from "@/contexts/userInfoContext";
import { FirebaseChatProvider } from "@/features/chat/contexts/chatContext";
import { AppContextProvider } from "@/contexts/appContext";
import { RentalityProvider } from "@/contexts/rentalityContext";
import { RntDialogsProvider } from "@/contexts/rntDialogsContext";
import { NotificationProvider } from "@/features/notifications/contexts/notificationContext";
import { useRouter } from "next/router";
import { ReactElement, ReactNode, useEffect } from "react";
import { analyticsPromise } from "@/utils/firebase";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/wagmi.config";
import { env } from "@/utils/env";
import Layout from "@/components/layout/layout";
import { initEruda, initHotjar } from "@/utils/init";
import FacebookPixelScript from "@/components/marketing/FacebookPixelScript";
import PlatformInitChecker from "@/components/common/PlatformInitChecker";
import WalletConnectChecker from "@/components/common/WalletConnectChecker";
import { NextComponentType, NextPage, NextPageContext } from "next";
import dynamic from "next/dynamic";
import TechnicalWork from "@/pages/technical_work";

const DimoAuthProvider = dynamic(() => import("@dimo-network/login-with-dimo").then((mod) => mod.DimoAuthProvider), {
  ssr: false,
});

type CustomAppProps = AppProps & {
  Component: NextComponentType<NextPageContext, any, any> & {
    allowAnonymousAccess?: boolean;
  } & NextPageWithLayout;
};

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export default function App({ Component, pageProps }: CustomAppProps) {
  const router = useRouter();
  const isHost = router.route.startsWith("/host");
  const queryClient = new QueryClient();

  const allowAnonymousAccess = Component.allowAnonymousAccess ?? false;

  useEffect(() => {
    analyticsPromise;
  }, []);

  useEffect(() => {
    initHotjar();
  }, []);

  useEffect(() => {
    initEruda();
  }, []);

  if (env.NEXT_PUBLIC_IS_TECHNICAL_WORK === "true") {
    return <TechnicalWork />;
  }

  if (Component.getLayout) {
    return Component.getLayout(<Component {...pageProps} />);
  } else {
    return (
      <>
        <FacebookPixelScript />
        <Web3Setup>
          <RentalityProvider>
            <DimoAuthProvider>
              <UserInfoProvider>
                <WagmiProvider config={wagmiConfig}>
                  <QueryClientProvider client={queryClient}>
                    <OnchainKitProvider apiKey={env.NEXT_PUBLIC_COINBASE_API_KEY} chain={base}>
                      <NotificationProvider isHost={isHost}>
                        <FirebaseChatProvider>
                          <AppContextProvider>
                            <RntDialogsProvider>
                              <PlatformInitChecker>
                                <WalletConnectChecker allowAnonymousAccess={allowAnonymousAccess}>
                                  <Layout>
                                    <Component {...pageProps} />
                                  </Layout>
                                </WalletConnectChecker>
                              </PlatformInitChecker>
                            </RntDialogsProvider>
                          </AppContextProvider>
                        </FirebaseChatProvider>
                      </NotificationProvider>
                    </OnchainKitProvider>
                  </QueryClientProvider>
                </WagmiProvider>
              </UserInfoProvider>
            </DimoAuthProvider>
          </RentalityProvider>
        </Web3Setup>
      </>
    );
  }
}

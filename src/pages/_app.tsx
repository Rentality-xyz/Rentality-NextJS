import "@/styles/globals.css";
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
// should be here for downloading 'locales/* '
import "../utils/i18n";
import { base } from "viem/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/tailwind.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/wagmi.config";
import { AuthProvider } from "@/contexts/auth/authContext";
import { env } from "@/utils/env";
import Hotjar from "@hotjar/browser";
import Layout from "@/components/layout/layout";
import Script from "next/script";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isHost = router.route.startsWith("/host");
  const queryClient = new QueryClient();

  useEffect(() => {
    analyticsPromise;
  }, []);

  useEffect(() => {
    Hotjar.init(env.NEXT_PUBLIC_HOTJAR_SITE_ID, env.NEXT_PUBLIC_HOTJAR_VERSION);
  }, []);

  useEffect(() => {
    if (env.NEXT_PUBLIC_USE_ERUDA_DEV_TOOLS === "true") {
      import("eruda").then((eruda) => eruda.default.init({ useShadowDom: true, autoScale: true }));
    }
  }, []);

  return (
    <>
      {/* Global Site Code Pixel - Facebook Pixel */}
      {env.NEXT_PUBLIC_FB_PIXEL_ID > 0 && (
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init',  '${env.NEXT_PUBLIC_FB_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      <Web3Setup>
        <RentalityProvider>
          <UserInfoProvider>
            <AuthProvider>
              <WagmiProvider config={wagmiConfig}>
                <QueryClientProvider client={queryClient}>
                  <OnchainKitProvider apiKey={env.NEXT_PUBLIC_COINBASE_API_KEY} chain={base}>
                    <NotificationProvider isHost={isHost}>
                      <FirebaseChatProvider>
                        <AppContextProvider>
                          <RntDialogsProvider>
                            <Layout>
                              <Component {...pageProps} />
                            </Layout>
                          </RntDialogsProvider>
                        </AppContextProvider>
                      </FirebaseChatProvider>
                    </NotificationProvider>
                  </OnchainKitProvider>
                </QueryClientProvider>
              </WagmiProvider>
            </AuthProvider>
          </UserInfoProvider>
        </RentalityProvider>
      </Web3Setup>
    </>
  );
}

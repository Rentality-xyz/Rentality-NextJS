import { CivicControl } from "@/components/CivicControl";
import { useRouter } from "next/router";
import { RentalityProvider } from "@/contexts/rentalityContext";
import { UserInfoProvider } from "@/contexts/userInfoContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AppContextProvider } from "@/contexts/useAppContext";
import {PrivyProvider} from "@privy-io/react-auth";
import logo from "../images/logo.png";

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
  return (
    <>
      <AppContextProvider>
        <RentalityProvider>
          <UserInfoProvider>
            <CivicControl>

              <PrivyProvider
                  appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
                  // onSuccess={() => router.push('/dashboard')}
                  config={{
                    loginMethods: ['wallet', 'email', 'sms', 'google', 'twitter', 'discord', 'github', 'apple'],
                    appearance: {
                      theme: '#1E1E30',
                      accentColor: '#676FFF',
                      logo: logo.src,
                    },
                  }}
              >
                <Component {...pageProps} />
              </PrivyProvider>

            </CivicControl>
          </UserInfoProvider>
        </RentalityProvider>
      </AppContextProvider>
    </>
  );
}

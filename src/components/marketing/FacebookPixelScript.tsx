import React from "react";
import Script from "next/script";
import { env } from "@/utils/env";

{
  /* Global Site Code Pixel - Facebook Pixel */
}
export default function FacebookPixelScript() {
  if (env.NEXT_PUBLIC_FB_PIXEL_ID <= 0) return <></>;

  return (
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
  );
}

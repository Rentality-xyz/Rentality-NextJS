import { env } from "@/utils/env";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link href="https://fonts.googleapis.com/css?family=Montserrat&display=optional" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-bold-rounded/css/uicons-bold-rounded.css" />
        <link
          rel="stylesheet"
          href="https://cdn-uicons.flaticon.com/uicons-regular-straight/css/uicons-regular-straight.css"
        />
        <link rel="preload" href="/platform_loader.gif" as="image" />
        {env.NEXT_PUBLIC_FB_PIXEL_ID > 0 && (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              alt=""
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${env.NEXT_PUBLIC_FB_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        )}
      </Head>
      <body className="backgroundMain font-['Montserrat',Arial,sans-serif] text-white">
        <div
          id="main_wrapper"
          className="mx-auto max-w-[1920px] overflow-hidden border-x-0 border-x-[#ffffff1f] min-[1921px]:border-x"
        >
          <Main />
        </div>
        <NextScript />
      </body>
    </Html>
  );
}

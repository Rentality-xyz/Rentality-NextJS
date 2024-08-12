import { Html, Head, Main, NextScript } from "next/document";
import Hotjar from '@hotjar/browser';

export default function Document() {
    const siteId = 4131425;
    const hotjarVersion = 6;

    Hotjar.init(siteId, hotjarVersion);

  return (
    <Html lang="en">
      <Head>
        <link href="https://fonts.googleapis.com/css?family=Montserrat&display=optional" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-bold-rounded/css/uicons-bold-rounded.css" />
        <link
          rel="stylesheet"
          href="https://cdn-uicons.flaticon.com/uicons-regular-straight/css/uicons-regular-straight.css"
        />
      </Head>
      <body className="backgroundMain">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

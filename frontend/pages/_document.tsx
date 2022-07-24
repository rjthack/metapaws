import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <title>Metapaws</title>

          <link rel="icon" type="image/png" href="/favicon.ico" />

          <meta name="theme-color" content="#ffffff" />
          <meta charSet="utf-8" />
          <script src="https://unpkg.com/flowbite@1.4.4/dist/flowbite.js"></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

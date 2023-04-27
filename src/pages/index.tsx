import Footer from "@/components/footer/footer";
import Header from "@/components/header";
import Layout from "@/components/layout";
import styles from "@/styles/Home.module.css";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>
          Rentality | Trust in our ambition. Rent a car with confidence
        </title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col w-full bg-blue-200">
        <div className="flex flex-col w-full place-self-center bg-blue-200">
          <Header />
          <div className="flex w-full h-full min-h-0 bg-red-100  md:bg-orange-300">
            <div>main</div>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

import "@/styles/globals.css";
import { ChakraProvider } from '@chakra-ui/react'
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import {
  sepolia,
  avalancheFuji
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import type { AppProps } from "next/app";

const { chains, publicClient } = configureChains([sepolia, avalancheFuji
], [publicProvider()]);
const config = createConfig(
  getDefaultConfig({
    alchemyId: "6NBS1tmp1c-2RuRjUJzY02wV9nh0Vtnn", //test
    walletConnectProjectId: "7d2b2502c872077d05e9a79e16f756ab",
    chains: chains,
    appName: "Kite",
    appDescription: "BNPL on Kite",
    appUrl: "https://family.co",
    appIcon: "https://family.co/logo.png",
  }),
);



export default function App({ Component, pageProps }: AppProps) {


  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

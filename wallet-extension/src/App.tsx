import * as React from "react"
import {
  ChakraProvider,
  extendTheme,
} from "@chakra-ui/react";
import { useState } from "react";
import LockScreen from "./pages/LockScreen";
import SplashScreen from "./components/SplashScreen/SplashScreen";
import {
  Routes,
  Route,
  useLocation
} from "react-router-dom";
import Home from "./pages/Home";
import HomeNav from "./components/Nav/HomeNav";
import Welcome from "./pages/Welcome";
import CreateAccount from "./pages/CreateAccount";
import ImportAccount from "./pages/ImportAccount";
import Send from "./pages/Send";
import ConfirmSend from "./pages/ConfirmSend";
import { tokens } from "./components/Tokens/MyTokens";



export const App = () => {

  const [showSplashScreen, setShowSplashScreen] = React.useState(true);
  const location = useLocation();
  const [seedPhrase, setSeedPhrase] = useState<any | null>(null)
  const [address, setWallet] = useState<any | null>(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(0)
  const [index, setIndex] = useState(0)
  const [roundedUpAmount, setroundedUpAmount] = useState(0)
  const [totalWithGas, settotalWithGas] = useState(0)
  const [gasEstimate, setGasEstimate] = useState(0)

  const args = { amount, recipient, setRecipient, index, setIndex, setAmount }
  const args2 = { sender: address, recipient, token: tokens[index].name, amount, roundedUpAmount, gasEstimate, totalWithGas }
  const customTheme = extendTheme({
    styles: {
      global: {
        body: {
          height: "600px",
          width: "400px",
          // border: "1px solid gray"
        },

      },
    },
  });


  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplashScreen(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (

    <ChakraProvider theme={customTheme}>
      {
        showSplashScreen && (
          <SplashScreen />
        )
      }

      <header>
        {
          !showSplashScreen && location.pathname === "/home" && (
            <HomeNav
              wallet={address}
            />
          )}
      </header>

      <Routes>
        <Route path="/" element={< Welcome />} />
        <Route path="/home" element={< Home
          address={address}
          seedPhrase={seedPhrase}
        />} />
        <Route path="/create" element={
          < CreateAccount
            setSeedPhrase={setSeedPhrase}
            setWallet={setWallet}
          />
        } />
        <Route path="/import" element={
          < ImportAccount
            setSeedPhrase={setSeedPhrase}
            setWallet={setWallet}
          />
        } />
        <Route path="/send" element={
          < Send
            {...args}
          />
        } />
        <Route path="/confirm" element={
          < ConfirmSend
            {...args2}
          />
        } />



      </Routes>

      {/* <LockScreen /> */}
    </ChakraProvider>
  )

}

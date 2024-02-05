import {
  ChakraProvider,
  extendTheme,
} from "@chakra-ui/react";
import {
  Routes,
  Route,
  useLocation
} from "react-router-dom";
import { useAppContext } from "./contexts/appContext";

import SplashScreen from "./components/SplashScreen/SplashScreen";
import HomeNav from "./components/Nav/HomeNav";

import LockScreen from "./pages/LockScreen";
import Home from "./pages/Home";
import Welcome from "./pages/Welcome";
import CreateAccount from "./pages/CreateAccount";
import ImportAccount from "./pages/ImportAccount";
import ConfirmSend from "./pages/ConfirmSend";
import { BiBorderBottom } from "react-icons/bi";



export const App = () => {
  const { showSplashScreen } = useAppContext();
  const location = useLocation();

  const customTheme = extendTheme({
    styles: {
      global: {
        body: {
          height: "600px",
          width: "400px",
          // border: "2px solid red"
        },

      },
    },
  });




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
            <HomeNav />
          )}
      </header>

      <Routes>
        <Route path="/" element={< Welcome />} />
        <Route path="/create" element={< CreateAccount />} />
        <Route path="/import" element={< ImportAccount />} />
        <Route path="/home" element={< Home />} />
        <Route path="/confirm" element={< ConfirmSend />} />
        <Route path="/lock" element={< LockScreen />} />
      </Routes>

    </ChakraProvider>
  )

}

import React, { } from 'react';
import {
  Box,
  Stack,
  Image,
  Button,
} from '@chakra-ui/react';
import { FaChrome } from 'react-icons/fa';



const Home: React.FC = () => {



  return (
    <Box
      display={"flex"}
      flexDir={"column"}
      alignItems={"center"}
      justifyContent={"center"}
      bgGradient="linear(to bottom, black, #111e1d)"
      color="white" minHeight="100vh">

      {/* <Flex
        position={"absolute"}
        w="100%"
        p={8}
        justifyContent={"flex-end"}
        top={0}>
        <ConnectKitButton />
      </Flex> */}

      <Box display={"flex"} flexDirection={"column"} alignItems="center" justifyContent="center">

        <Image
          src="/logo.svg"
          h="150px"
          w="auto"
        />

        <Box my={4} color="#06b670">
          <span style={{
            color: "#c5ff48"
          }}>
            Savings
          </span> Wallet
        </Box>


        <Stack pt={3} justifyContent={"center"} w="100%" spacing={5} direction={["column", "column", "row"]}>

          <Button
            fontSize={"2xl"}
            leftIcon={<FaChrome />}
            h="65px"
            onClick={() => window.open("https://drive.google.com/file/d/1JNK3nxSb7jVzjejxmaXe3H9iVcOz416y/view?usp=sharing")}>
            Download Extension
          </Button>

        </Stack>

      </Box>

    </Box>
  );
};



export default Home;

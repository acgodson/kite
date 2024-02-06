import React, { } from 'react';
import {
  ChakraProvider,
  Box,
  Text,
  Flex,
  Stack,
  Heading,
  List,
  ListItem,
  Image,
  Icon,
  Center,
  Button,
  Divider,
  HStack,
} from '@chakra-ui/react';
import {  FaChrome } from 'react-icons/fa';
import { MetaMaskInpageProvider } from '@metamask/providers';



declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider
  }
}

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
          >
            Download Extension
          </Button>

        </Stack>

      </Box>

    </Box>
  );
};


const FeatureListItem: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <ListItem py={2} display="flex" alignItems="center">
    {icon}
    <Heading size="15px" fontWeight={'semibold'} mb={2} ml={4}>{text}</Heading>
  </ListItem>
);

export default Home;

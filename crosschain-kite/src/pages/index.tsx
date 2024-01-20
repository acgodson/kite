import React from 'react';
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
} from '@chakra-ui/react';
import { GiCheckMark } from 'react-icons/gi';


const Home: React.FC = () => {
  return (
    <Box
      display={"flex"}
      flexDir={"column"}
      alignItems={"center"}
      justifyContent={"center"}
      bgGradient="linear(to bottom, black, #111e1d)"
      color="white" minHeight="100vh">


      <Flex position={"absolute"} w="100%"
        p={8}
        justifyContent={"flex-end"}
        top={0}>

        <Button colorScheme="green">Connect Wallet</Button>

      </Flex>

      <Flex direction="column" align="center" justify="center">


        <Image
          src="/logo.svg"
          h="150px"
          w="auto"
        />


        <Text my={4} color="#06b670">
          <span style={{
            color: "#c5ff48"
          }}>
            Buy Now Pay Later
          </span> on Aaeve Protocol.
        </Text>

        {/* Comparing Features */}
        <Stack spacing={6} align="start" mb={12}

        >
          <Stack spacing={5} direction={["column", "column", "row"]}>
            <List border={"1px solid gray"} p={8} borderRadius={"12px"}>
              <FeatureListItem icon={<Icon as={GiCheckMark} color={"#06b670"} />} text="Crosschain" />
              <FeatureListItem icon={<Icon as={GiCheckMark} color={"#06b670"} />} text="Offset interest from yield" />
              <FeatureListItem icon={<Icon as={GiCheckMark} color={"#06b670"} />} text="ERC4626 Share preview" />
            </List>

            <List border={"1px solid gray"} p={8} borderRadius={"12px"}>

              <Center>
                <Box>    <Button>Add Campaign</Button></Box> <Box w={5} />
                <Box>          <Button>New Payment</Button></Box>
              </Center>


            </List>
          </Stack>
        </Stack>


        <Stack w="100%">
          <Text fontSize={"xl"} fontWeight={"semi-bold"} color={"whiteAlpha.500"}> In Progress</Text>
          < Divider />

        </Stack>



      </Flex>
    </Box>
  );
};


const FeatureListItem: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <ListItem display="flex" alignItems="center">
    {icon}
    <Heading size="md" mb={2} ml={4}>{text}</Heading>
  </ListItem>
);

export default Home;

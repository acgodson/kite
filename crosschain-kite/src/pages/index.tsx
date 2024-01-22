import React, { useState } from 'react';
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
import { GiCheckMark } from 'react-icons/gi';
import { useAccount } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import CreateCampaignModal from '@/components/Modals/CreateModal';
import { AddBillModal } from '@/components/Modals/Addbill';


const Home: React.FC = () => {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const toggleCreateCampaignModal = () => {
    setIsCreateCampaignModalOpen(!isCreateCampaignModalOpen);
  };
  const toggleBillModalOpen = () => {
    setIsBillModalOpen(!isBillModalOpen);
  };



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
        <ConnectKitButton />
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
          </span> with Aave Integration.
        </Text>

        {/* Comparing Features */}
        <Stack spacing={6} align="start" mb={12}
          w="100%"
        >
          <Stack w="100%" spacing={5} direction={["column", "column", "row"]}>
            {!address ?
              <List border={"1px solid gray"} p={8} borderRadius={"12px"} w="100%">
                <FeatureListItem icon={<Icon as={GiCheckMark} color={"#06b670"} />} text="Access Controlled Vaults" />
                <FeatureListItem icon={<Icon as={GiCheckMark} color={"#06b670"} />} text="Earn Offsets from deposits" />
                <FeatureListItem icon={<Icon as={GiCheckMark} color={"#06b670"} />} text="Automatic Liquidation" />
              </List> :
              <Box minW="300px" border={"1px solid gray"} p={8} borderRadius={"12px"} w="100%">
                <Text textAlign={"right"} fontSize={"sm"} fontWeight={"semibold"}>My Balance</Text>
                <Center>
                  <Box textAlign={"center"}>
                    <HStack>
                      <Box> <Text fontSize={"2xl"} fontWeight={"bold"}>0</Text>
                      </Box>
                    </HStack>
                    <Divider py={2} />
                    <HStack py={2}>
                      <Box borderRight={'0.5px solid white'} px={3}>
                        <Text fontSize={"xs"} color={"#06b670"} fontWeight={"bold"}>Vault</Text>
                        <Text fontSize={"xs"} fontWeight={"bold"}>0 GHO</Text>
                      </Box>
                      <Box borderRight={'0.5px solid white'} px={3}>
                        <Text fontSize={"xs"} color={"#06b670"} fontWeight={"bold"}>Lqd</Text>
                        <Text fontSize={"xs"} fontWeight={"bold"}>0 USDC</Text>
                      </Box>
                      <Box borderRight={'none'} px={3}>
                        <Text fontSize={"xs"} color={"#06b670"} fontWeight={"bold"}>Profits</Text>
                        <Text fontSize={"xs"} fontWeight={"bold"}>0%</Text>
                      </Box>
                    </HStack>

                  </Box>
                </Center>



              </Box>

            }

            <List w="100%" border={"1px solid gray"} p={8} borderRadius={"12px"}>

              {address ?
                <>
                  <Center>
                    <Box>    <Button
                      onClick={toggleCreateCampaignModal}
                    >Add Campaign</Button></Box> <Box w={5} />
                    <Box>          <Button
                      onClick={toggleBillModalOpen}
                    >New Payment</Button></Box>
                  </Center>

                </> :
                <Center>
                  <Box>
                    <Text
                      color="linear(to bottom, black, #111e1d)"
                      fontWeight={"black"}
                      fontSize={'xl'} py={3}>Pay in Kite Installment</Text>
                    <ConnectKitButton />

                  </Box>
                </Center>

              }



            </List>
          </Stack>
        </Stack>


        <Stack w="100%">
          <Text fontSize={"xl"} fontWeight={"semi-bold"} color={"whiteAlpha.500"}> In Progress</Text>
          < Divider />

        </Stack>
      </Flex>


      <CreateCampaignModal isOpen={isCreateCampaignModalOpen} onClose={toggleCreateCampaignModal} />
      <AddBillModal isOpen={isBillModalOpen} onClose={toggleBillModalOpen} />

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

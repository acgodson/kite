import React, { useEffect, useState } from 'react';
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
import { useAccount, useNetwork } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import CreateCampaignModal from '@/components/Modals/CreateModal';
import { AddBillModal } from '@/components/Modals/Addbill';
import { ethers } from 'ethers';
import vaultFactory from '@/utils/vault.json'
import { FaAddressBook } from 'react-icons/fa';
import { MetaMaskInpageProvider } from '@metamask/providers';
import TradeList from '@/components/TradeList';



declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider
  }
}

const Home: React.FC = () => {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [myTrades, setAllTrades] = useState<any[] | null>(null);
  const [shares, setShares] = useState<number | null>(null);
  const [lqds, setLqds] = useState<number | null>(null);
  const { chain } = useNetwork()



  const toggleCreateCampaignModal = () => {
    setIsCreateCampaignModalOpen(!isCreateCampaignModalOpen);
  };
  const toggleBillModalOpen = () => {
    setIsBillModalOpen(!isBillModalOpen);
  };

  function TimestampsToDateStrings(timestamps: any[]): string[] {
    return timestamps.map(timestamp => {
      const date = new Date(Number(timestamp) * 1000); // Convert timestamp to milliseconds
      return date.toDateString(); // Convert date to string
    });
  }

  function BigAmountsAmounts(amounts: any[]): number[] {
    return amounts.map(amount => {
      const value = Number(amount); // Convert timestamp to milliseconds
      return value; // Convert date to string
    });
  }


  const getTrades = async () => {
    if (!address || chain?.name !== 'Sepolia') {
      return
    }
    try {
      const { ethereum } = window;

      if (!ethereum && chain?.name !== 'Sepolia') {
        //no web3 extension 
        return;
      }
      const provider = new ethers.BrowserProvider(ethereum!);
      const signer = provider.getSigner();
      const vaultAddress = "0x8821A0696597554a4E58D0773776DCEA9E12c649";

      const contract = new ethers.Contract(vaultAddress, vaultFactory.abi, await signer);
      const tradeResult = await contract.getAllTradesByDepositor(address);
      const trades = await Promise.all(
        tradeResult.map(async (trade: any) => {
          return {
            total: Number(trade.total),
            settled: Number(trade.settled),
            dates: TimestampsToDateStrings(trade.dueDates),
            splits: BigAmountsAmounts(trade.amounts),
            settledDates: Object.values(trade.paidDueDates),
            paymentClosed: trade.closed
          };
        })
      );

      return trades;
    } catch (error) {
      console.error('Error fetching trades:', error);
      return [];
    }
  };


  const getBalance = async () => {
    if (!address || chain?.name !== 'Sepolia') {
      return
    }
    try {
      const { ethereum } = window;

      if (!ethereum && chain?.name !== 'Sepolia') {
        //no web3 extension 
        return;
      }
      const provider = new ethers.BrowserProvider(ethereum!);
      const signer = provider.getSigner();
      const vaultAddress = "0x8821A0696597554a4E58D0773776DCEA9E12c649";

      const contract = new ethers.Contract(vaultAddress, vaultFactory.abi, await signer);
      const shares = await contract.depositorShares(address);
      const lqds = await contract.liquidations(address)
      console.log(lqds);
      setShares(Number(shares));
      setLqds(Number(lqds));
      return;

    } catch (error) {
      console.error('Error fetching trades:', error);
      return [];
    }
  };


  useEffect(() => {
    const fetchCampaigns = async () => {
      const trades = await getTrades();
      console.log(trades)
      if (trades) {
        setAllTrades(trades as any);
      }
    };

    if (!myTrades) {
      fetchCampaigns();
    }

  }); // Run only once on component mount


  useEffect(() => {
    if (address && chain?.name === 'Sepolia' && !shares) {
      getBalance();
    }
  })




  return (
    <Box
      display={"flex"}
      flexDir={"column"}
      alignItems={"center"}
      justifyContent={"center"}
      bgGradient="linear(to bottom, black, #111e1d)"
      color="white" minHeight="100vh">


      <Flex
        position={"absolute"}
        w="100%"
        p={8}
        justifyContent={"flex-end"}
        top={0}>
        <ConnectKitButton />
      </Flex>

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
            Buy Now Pay Later
          </span> with Aave Integration.
        </Box>

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
                      <Box> <Text fontSize={"2xl"} fontWeight={"bold"}>${shares ? lqds! + shares : 0}</Text>
                      </Box>
                    </HStack>
                    <Divider py={2} />
                    <HStack py={2}>
                      <Box borderRight={'0.5px solid white'} px={3}>
                        <Text fontSize={"xs"} color={"#06b670"} fontWeight={"bold"}>Vault</Text>
                        <Text fontSize={"xs"} fontWeight={"bold"}>{shares} GHO</Text>
                      </Box>
                      <Box borderRight={'0.5px solid white'} px={3}>
                        <Text fontSize={"xs"} color={"#06b670"} fontWeight={"bold"}>Lqd</Text>
                        <Text fontSize={"xs"} fontWeight={"bold"}>{lqds} USDC</Text>
                      </Box>
                      <Box borderRight={'none'} px={3}>
                        <Text fontSize={"xs"} color={"#06b670"} fontWeight={"bold"}>Swaps</Text>
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
                    <Box>     <ConnectKitButton />
                    </Box>
                  </Box>
                </Center>

              }



            </List>
          </Stack>
        </Stack>


        <Stack w="100%">
          <Text fontSize={"xl"} fontWeight={"semi-bold"} color={"whiteAlpha.500"}> In Progress</Text>
          < Divider />

          {myTrades && myTrades?.length > 0 && <TradeList trades={myTrades} />}

        </Stack>
      </Box>


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

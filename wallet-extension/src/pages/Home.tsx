import * as React from "react";
import { ChakraProvider, Text, Box, Tab, TabList, TabPanel, TabPanels, Tabs, Center, Heading, Flex, Button, HStack, useDisclosure, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Slide, Card, List, ListItem } from "@chakra-ui/react";
import { FaWallet, FaMoneyCheck, FaChartLine, FaCog, FaHistory, FaClock, FaArrowDown, FaLongArrowAltUp, FaExchangeAlt } from "react-icons/fa";
import HomeNav from "../components/Nav/HomeNav";
import MyTokens from "../components/Tokens/MyTokens";
import { FiExternalLink } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";
import { ethers, Wallet } from "ethers";
import { useEffect, useState } from "react";
import { PegasusRPC } from "../utils/consts";
import SettingsView from "../components/Settings/Settings";



const finance = [

    {
        title: "Featured",
        items: [
            {
                img: "",
                name: "Safe Lock",
                color: ""
            },
            {
                img: "",
                name: "Target Savings",
                color: ""
            },
            {
                img: "",
                name: "Flexi",
                color: ""
            },
        ]
    },

    {
        title: "Save and Earn",
        items: [
            {
                img: "",
                name: "Yield Vault",
                color: ""
            },
        ]
    },

    {
        title: "Tools and Analytics",
        items: [
            {
                img: "",
                name: "Gemini Tracker",
                color: ""
            },
        ]
    }
]


const Home = ({ address, seedPhrase }: { address: string, seedPhrase: string }) => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState<number | null>(null);
    const [privateKey, setPrivateKey] = useState();
    const [index, setIndex] = useState(0);

    const userAddress = "0xf2750684eB187fF9f82e2F980f6233707eF5768C";
    const apiUrl = `https://pegasus.lightlink.io/api/v2/addresses/${userAddress}/transactions?filter=from`;


    async function fetchOutgoingTransactions() {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (response.ok) {
                const outgoingTransactions: any = data.items.filter((transaction: any) => transaction.from.hash.toLowerCase() === userAddress.toLowerCase());

                // Display the relevant information for outgoing transactions
                outgoingTransactions.forEach((transaction: any) => {
                    console.log(`Timestamp: ${transaction.timestamp}`);
                    console.log(`To Address: ${transaction.to.hash}`);
                    console.log(`Amount: ${transaction.value} wei`);
                    console.log("---");
                });
            } else {
                console.error(`Failed to fetch data. Status code: ${response.status}`);
            }
        } catch (error: any) {
            console.error("Error during fetch:", error.message);
        }
    }


    const getBalance = async () => {
        const chain = PegasusRPC  //chains_config[selectedChain]
        //get wallet from seedPhrase
        const privateKey = Wallet.fromPhrase(seedPhrase).privateKey;
        const provider = new ethers.JsonRpcProvider(chain);
        const connectedWallet = new Wallet(privateKey, provider);

        // const tx = {
        //     to: to,
        //     value: ethers.parseEther(amount.toString());
        // }

        const balance = await connectedWallet.provider?.getBalance(address);
        console.log("Balance:", balance?.toString());
        //fix this
        const roundedBalance = parseFloat(ethers.formatEther(balance as any)).toFixed(Math.max(2, balance?.toString().split(".")[1]?.length || 0))
        console.log(roundedBalance);
        setBalance(parseFloat(roundedBalance));
        console.log(Number(balance));



        await fetchOutgoingTransactions();


    }

    useEffect(() => {
        getBalance();

    }, [])




    return (
        <>
            <Tabs tabIndex={index} colorScheme="green" variant="enclosed-colored" isFitted h="600px">
                <Box h="550px" overflowY={"auto"}>
                    <TabPanels pt={12} minH="550px">
                        {/* Home */}
                        <TabPanel>
                            <Box
                                p="4"
                                borderRadius={"12px"}
                                border={"0.1px solid rgba(50, 143, 93, 0.3)"}
                                bg="rgba(50, 143, 93, 0.1)"
                            >
                                <Center>
                                    <Box w="100%">
                                        <Heading opacity={'0.9'} fontWeight={'semibold'} textAlign={"center"}>{balance !== null ? `${balance} ETH` : '0 ETH'}</Heading>
                                        <Text textAlign={"center"}>$100.00</Text>
                                        <HStack justifyContent={"center"} spacing={5} py={3}>
                                            <Button leftIcon={<FaArrowDown />} position={"relative"} color="white" bg="#2f855a" w="120px">Receive</Button>
                                            <Button
                                                onClick={() => navigate("/send")}
                                                leftIcon={<FaLongArrowAltUp />} color="white" bg="#2f855a" w="120px">Send</Button>
                                            <Button leftIcon={<FaExchangeAlt />} color="white" bg="#2f855a" w="120px">Bridge</Button>
                                        </HStack>
                                    </Box>
                                </Center>
                            </Box>
                            <MyTokens />
                        </TabPanel>

                        {/* Kite Finance */}
                        <TabPanel>
                            <Box
                                p="4"
                                borderRadius={"12px"}
                                bg={"rgba(50, 143, 93, 0.3)"}
                            >
                                <HStack justifyContent={"center"} alignItems={"center"} spacing={3}>   <Text textAlign={"center"}>Better ways to Save & Invest</Text>
                                    <FiExternalLink /></HStack>
                            </Box>
                            <Box>
                                {
                                    finance.map((feature, index) => (
                                        <Box key={index}>
                                            <Text pb={4} fontSize={"sm"} pt={8}>• {feature.title}</Text>
                                            <HStack
                                                alignItems={"center"}
                                                justifyContent={index === 0 ? "space-around" : 'flex-start'}>
                                                {feature.items.map((pool, i) => (
                                                    <Card
                                                        key={i}
                                                        alignSelf={"flex-start"}
                                                        borderRadius={"12px"}
                                                        bg={"rgba(50, 143, 93, 0.3)"}
                                                        boxShadow={"none"}
                                                        py={3}
                                                        px={2}
                                                        h="100px"
                                                        w="100px"
                                                    >
                                                        <Center h="100%">
                                                            <Text fontSize={"sm"} fontWeight={"semibold"}>{pool.name}</Text>
                                                        </Center>
                                                    </Card>
                                                ))}
                                            </HStack>
                                        </Box>
                                    ))
                                }

                            </Box>
                        </TabPanel>

                        {/* Activity */}
                        <TabPanel>
                            <Box p="4">Activity Content</Box>
                        </TabPanel>

                        {/* Settings */}
                        <TabPanel>
                            {/* <Box p="4">Settings Content</Box> */}
                            <SettingsView address={address} />
                        </TabPanel>


                    </TabPanels>

                </Box>

                <TabList
                    w="400px"
                    // zIndex={"tooltip"}
                    position={'fixed'}
                    h="50px">
                    <Tab>
                        <FaWallet />
                    </Tab>
                    <Tab>
                        <FaChartLine />

                    </Tab>
                    <Tab>
                        {/* <FaMoneyCheck /> */}
                        <FaClock />
                    </Tab>
                    <Tab>
                        <FaCog />
                    </Tab>
                </TabList>
            </Tabs>

            {/* <HomeNav /> */}
        </>


    );
};

export default Home;
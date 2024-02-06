import { Button, Box, Text, FormLabel, List, Input, Image, VStack, HStack, useColorMode, Avatar, InputGroup, InputRightElement, Center, Heading, IconButton, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Flex, Select, Card, ListItem, Divider, } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { fetchCryptoPriceInUSD, shortenAddress } from "../../utils/helpers";
import { ColorModeSwitcher } from "../Nav/ColorModeSwitcher";
import { BiArrowBack, BiChevronLeft, BiTrash } from "react-icons/bi";
import { RiSendPlane2Line } from "react-icons/ri";
import { FaArrowDown, FaArrowLeft, FaArrowRight, FaChevronRight, FaEllipsisV, FaExchangeAlt, FaExternalLinkAlt, FaEye, FaEyeSlash, FaKey, FaLink, FaLongArrowAltUp, FaPiggyBank } from "react-icons/fa";
import MyTokens from "./MyTokens";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../contexts/appContext";
import { KiteContract, PegasusRPC } from "../../utils/consts";
import Send from "./Send";
import logo from "../../assets/logo.webp";
import KiteArtifact from "../../utils/Kite.json"
import { FiExternalLink } from "react-icons/fi";
import safe from "../../assets/safe.png";
import target from "../../assets/target.png";
import flexi from "../../assets/flexi.png";
import vault from "../../assets/vault.png";
import gemini from "../../assets/gemini.png";
import rect from "../../assets/rect.png";
import kiteArtifact from "../../utils/Kite.json"
import { Transaction } from "../../utils/types";
import { ethers, formatEther } from "ethers";


interface Asset {
    token: {
        address: string,
        circulating_market_cap: null | string,
        decimals: string,
        exchange_rate: null,
        holders: string,
        icon_url: null | string,
        name: string,
        symbol: string,
        total_supply: string,
        type: string
    },
    token_id: null | string,
    token_instance: null | string,
    value: string
}





const ActivityView = () => {
    const navigate = useNavigate();
    const { activeAccount } = useAppContext();
    const { colorMode } = useColorMode();
    const [sortedTransactions, setSortedTransactions] = useState<Record<string, any[]>>({});
    const [fetching, setFetching] = useState();

    // Function to fetch and manipulate transactions
    const fetchTransactions = async () => {
        const address = activeAccount?.address;
        const url = `https://pegasus.lightlink.io/api/v2/addresses/${address}/transactions?filter=to%20%7C%20from`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            // Manipulate the transactions
            const manipulatedTransactions = data.items.map((transaction: any) => {
                if (transaction.tx_types.includes("coin_transfer")) {
                    transaction.method = "Transfer";
                } else if (transaction.tx_types.includes("contract_call")) {
                    transaction.method = "Contract Interaction";
                }
                return transaction;
            });

            // Sort and group transactions by date
            const groupedTransactions = manipulatedTransactions.reduce((acc: Record<string, any[]>, transaction: any) => {
                const date = new Date(transaction.timestamp).toDateString();
                acc[date] = [...(acc[date] || []), transaction];
                return acc;
            }, {});


            setSortedTransactions(groupedTransactions);

        } catch (error) {
            setSortedTransactions({})
            console.error("Error fetching transactions:", error);
            return [];
        }
    };


    useEffect(() => {
        if (activeAccount) {
            fetchTransactions();
        }
    }, [activeAccount])



    return (
        <Box>
            <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bg={colorMode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
                backdropFilter="blur(12px)"
                zIndex="-1"
            />


            <Popover
                placement="top">
                <Box>
                    {sortedTransactions &&
                        Object.entries(sortedTransactions).map(([date, transactions], index) => (

                            <Box key={`${date}-${index}`}>
                                <Text py={3} fontSize={"sm"} fontWeight={"semibold"}>{date}</Text>

                                {transactions.map((transaction: Transaction, i: number) => (
                                    <Box
                                        position={"relative"}
                                        key={`${i}-${transaction.hash}`}
                                    >
                                        <Popover
                                        >
                                            <PopoverTrigger>
                                                <HStack
                                                    cursor={"pointer"}
                                                    py={2} justifyContent={"space-between"}

                                                >
                                                    <Flex align={"center"}>


                                                        <Avatar h="40px" w="40px" icon={
                                                            !Array.isArray(transaction.to) && transaction.method
                                                                &&
                                                                transaction.method!.toLowerCase() === "transfer" ?
                                                                shortenAddress(transaction.to.hash) === shortenAddress(activeAccount?.address!) ?
                                                                    <FaArrowDown
                                                                        style={{
                                                                            transform: "rotate(300deg)",
                                                                            color: "green"
                                                                        }}
                                                                    /> :
                                                                    <FaArrowDown
                                                                        style={{
                                                                            transform: "rotate(-150deg)",
                                                                            color: "red"
                                                                        }}
                                                                    /> : <FaExchangeAlt />}

                                                        />

                                                        <Box ml={3}>
                                                            <Text fontSize={"sm"} >{transaction.method}</Text>
                                                            <Text
                                                                fontSize={"xs"}
                                                                color={transaction.status === "ok" ? "green.500" : "red.500"}
                                                            >{transaction.status === "ok" ? "Confirmed" : "Failed"}</Text>
                                                        </Box>

                                                    </Flex>

                                                    <Box>
                                                        <Text
                                                            fontWeight={"semibold"}
                                                        >{parseFloat(ethers.formatEther(transaction.value as any)).toFixed(Math.max(2, transaction.value?.toString().split(".")[1]?.length || 0))} ETH</Text>


                                                    </Box>
                                                </HStack>
                                            </PopoverTrigger>
                                            <PopoverContent
                                            // maxH="400px"
                                            >
                                                <PopoverArrow />
                                                <PopoverCloseButton />
                                                <PopoverHeader>{transaction.method}</PopoverHeader>
                                                <PopoverBody fontSize={"xs"}>
                                                    <Box w="100%">
                                                        <HStack
                                                            py={3}
                                                            w="100%" justifyContent={"space-between"} alignItems={'center'}>
                                                            <Box
                                                                textAlign={"left"}

                                                            >
                                                                <Text>Status</Text>
                                                                <Text
                                                                    pt={2}
                                                                    fontWeight={"bold"}
                                                                    fontSize={"xs"}
                                                                    color={transaction.status === "ok" ? "green.500" : "red.500"}
                                                                >{transaction.status === "ok" ? "Confirmed" : "Failed"}</Text>
                                                            </Box>

                                                            <VStack
                                                                fontSize={"xs"}
                                                            >
                                                                <Box as='a' href="" textDecoration={"underline"}>View in Explorer</Box>
                                                                <Box as='button' textDecoration={"underline"}>  Copy transaction ID</Box>
                                                            </VStack>
                                                        </HStack>

                                                        <HStack
                                                            py={3}
                                                            w="100%" justifyContent={"space-between"} alignItems={'center'}>
                                                            <Box
                                                                textAlign={"left"}

                                                            >
                                                                <Text>From</Text>
                                                                <Text
                                                                    fontWeight={"bold"}
                                                                    fontSize={"xs"}
                                                                >
                                                                    {shortenAddress(transaction.from.hash)}
                                                                </Text>
                                                            </Box>

                                                            <Box
                                                                fontSize={"xs"}
                                                            >
                                                                <Text>To</Text>
                                                                <Text
                                                                    fontWeight={"bold"}
                                                                    fontSize={"xs"}
                                                                >
                                                                    {transaction.to && !Array.isArray(transaction.to) && shortenAddress(transaction.to.hash)}
                                                                </Text>
                                                            </Box>

                                                        </HStack>

                                                        <Box mt={4}>
                                                            <Text pb={2} fontWeight={'bold'} fontSize={"sm"}>Transaction</Text>
                                                            <HStack
                                                                py={3}
                                                                w="100%" justifyContent={"space-between"} alignItems={'center'}>
                                                                <Text>Nounce</Text>
                                                                <Text
                                                                    fontWeight={"bold"}
                                                                    fontSize={"xs"}
                                                                >
                                                                    {transaction.nonce}
                                                                </Text>
                                                            </HStack>
                                                            <HStack
                                                                py={3}
                                                                w="100%" justifyContent={"space-between"} alignItems={'center'}>
                                                                <Text>Amount</Text>
                                                                <Text
                                                                    fontWeight={"bold"}
                                                                    fontSize={"xs"}
                                                                >
                                                                    {parseFloat(ethers.formatEther(transaction.value as any)).toFixed(Math.max(2, transaction.value?.toString().split(".")[1]?.length || 0))} ETH
                                                                </Text>
                                                            </HStack>
                                                            <HStack
                                                                py={3}
                                                                w="100%" justifyContent={"space-between"} alignItems={'center'}>
                                                                <Text>Gas Limit (Units)</Text>
                                                                <Text
                                                                    fontWeight={"semibold"}
                                                                    fontSize={"xs"}
                                                                >
                                                                    {/* {parseFloat(ethers.formatEther(transaction.gas_limit as any)).toFixed(Math.max(2, transaction.gas_limit?.toString().split(".")[1]?.length || 0))} */}
                                                                    {transaction.gas_limit}
                                                                </Text>
                                                            </HStack>
                                                            <HStack
                                                                py={3}
                                                                w="100%" justifyContent={"space-between"} alignItems={'center'}>
                                                                <Text>Gas Used (Units)</Text>
                                                                <Text
                                                                    fontWeight={"semibold"}
                                                                    fontSize={"xs"}
                                                                >
                                                                    {/* {transaction.gas_used} */}
                                                                    {formatEther(transaction.gas_used)}
                                                                </Text>
                                                            </HStack>
                                                            <HStack
                                                                py={3}
                                                                w="100%" justifyContent={"space-between"} alignItems={'center'}>
                                                                <Text>Gas Price (Units)</Text>
                                                                <Text
                                                                    fontWeight={"bold"}
                                                                    fontSize={"xs"}
                                                                >
                                                                    {/* {transaction.gas_price} */}
                                                                    {formatEther(transaction.gas_price)}


                                                                </Text>
                                                            </HStack>


                                                        </Box>


                                                    </Box>
                                                </PopoverBody>
                                            </PopoverContent>
                                        </Popover>
                                    </Box>
                                ))}
                            </Box>
                        ))
                    }
                </Box>
            </Popover>
        </Box>
    )
};

export default ActivityView;
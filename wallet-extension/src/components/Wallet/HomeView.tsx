import { Button, Box, Text, FormLabel, Input, Image, VStack, HStack, Center, Heading, IconButton, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Flex, Select, Spinner, useColorMode, Divider, Tooltip, } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, ethers } from "ethers";
import { BiChevronLeft } from "react-icons/bi";
import { RiAddCircleLine, RiSendPlane2Line, RiSubtractLine } from "react-icons/ri";
import { FaArrowDown, FaChevronRight, FaEllipsisV, FaExchangeAlt, FaExternalLinkAlt, FaGift, FaLongArrowAltDown, FaLongArrowAltUp, FaPiggyBank } from "react-icons/fa";
import { useAppContext } from "../../contexts/appContext";
import { PegasusRPC, SafeLockContract, KiteContract, Target, Vault, Flexi, strategies } from "../../utils/consts";
import { fetchCryptoPriceInUSD, shortenAddress } from "../../utils/helpers";
import logo from "../../assets/logo.webp";
import KiteArtifact from "../../utils/Kite.json";

import MyTokens from "./MyTokens";
import Send from "./Send";
import { FiUpload } from "react-icons/fi";
import { Asset } from "../../utils/types";
import { useWallet } from "../../hooks/useWallet";
import { useStrategy } from "../../hooks/useStrategy";



const HomeView = () => {
    const {
        activeAccount,
        balance,
        setBalance,
        tokens,
        setTokens,
        setAmount,
        selectedToken,
        setSelectedToken,
        setContractAddress,
        setMethod,
        setParams,
        pool,
        setPool,
        // fetching, setFetching
    } = useAppContext();
    const [view, setView] = useState("home");
    const [strategy, setStrategy] = useState("");
    // const [selectedClone, setSelectedClone] = useState<string>("");
    // const [selectedDate, setSelectedDate] = useState(new Date());
    // const [optedIn, setOptedIn] = useState<any | null>(null);
    const { colorMode } = useColorMode();
    const [showTooltip, setShowTooltip] = useState(false);
    const { price } = useWallet();
    const {
        handleDateChange,
        fetchingSavings,
        setFetchingSavings,
        clones,
        setClones,
        selectedClone,
        setSelectedClone,
        selectedDate,
        setSelectedDate,
        optedIn,
        setOptedIn,
        handleOptIn,
        handleCreatePool,
        getPoolDetails,
    } = useStrategy(strategy);


    switch (view) {
        case "home":
            return (
                <>
                    <Box
                        p="4"
                        borderRadius={"12px"}
                        border={"0.1px solid rgba(50, 143, 93, 0.3)"}
                        bg="rgba(50, 143, 93, 0.1)"
                    >
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
                        <Center>
                            <Box w="100%">
                                <Heading opacity={'0.9'} fontWeight={'semibold'} textAlign={"center"}>{balance !== null ? `${balance} ETH` : '0 ETH'}</Heading>
                                <Text textAlign={"center"}>${price}</Text>
                                <HStack justifyContent={"center"} spacing={5} py={3}>
                                    <Button
                                        leftIcon={<FaArrowDown
                                            style={{
                                                transform: "rotate(300deg)"
                                            }}
                                        />}
                                        // isDisabled={true}
                                        position={"relative"}
                                        color="white"
                                        bg="#2f855a"
                                        borderRadius={"12px"}
                                        _hover={{
                                            bg: "#2f855a"
                                        }}
                                        isDisabled={true}
                                        w="120px">Receive</Button>

                                    <Button
                                        onClick={() => {
                                            setView("send");
                                            setSelectedToken("ETH");
                                        }
                                        }
                                        leftIcon={<FaArrowDown
                                            style={{
                                                transform: "rotate(-150deg)",
                                                // color: "green"
                                            }}
                                        />}
                                        color="white"
                                        bg="#2f855a"
                                        borderRadius={"12px"}
                                        _hover={{
                                            bg: "#2f855a"
                                        }}
                                        w="120px">Send</Button>
                                    <Button leftIcon={<FaExchangeAlt />}
                                        color="white"
                                        bg="#2f855a"
                                        borderRadius={"12px"}
                                        _hover={{
                                            bg: "#2f855a"
                                        }}
                                        isDisabled={true}
                                        w="120px">Bridge</Button>
                                </HStack>
                            </Box>
                        </Center>
                    </Box>

                    <MyTokens tokens={tokens} setView={setView} setSelectedToken={setSelectedToken} />
                </>
            );

        case "send":
            return (
                <>
                    <Send tokens={tokens} selected={selectedToken} setSelectedToken={setSelectedToken} setView={setView} balance={balance?.toString()!} />
                </>
            );

        case "token":
            const _index: any = tokens?.findIndex((token: Asset) => token.token.symbol === selectedToken);
            const tokenName: string = tokens![_index].token.symbol;
            const tokenAddr: string = tokens?.filter((x: Asset) => x.token.symbol === selectedToken)[0].token.address!;
            const _tokenBal: string = tokens![_index].value;
            const _roundedBalance = parseFloat(ethers.formatEther(_tokenBal as any)).toFixed(Math.max(2, _tokenBal?.toString().split(".")[1]?.length || 0))

            return (
                <>
                    <HStack py={3}>
                        <IconButton
                            onClick={() => setView("home")}
                            icon={<BiChevronLeft />} aria-label={"back-to-home"} />
                        <Text fontWeight={"bold"}>{tokenName}</Text>
                        <Popover>
                            <PopoverTrigger>
                                <Button
                                    bg='transparent'
                                ><FaEllipsisV /></Button>
                            </PopoverTrigger>
                            <PopoverContent w="fit-content">
                                <PopoverArrow />
                                <PopoverBody w="fit-content">
                                    <HStack display={"flex"} spacing={2} alignItems="center" fontSize={"xs"} fontWeight={"semibold"}>
                                        <Text>View Asset in Explorer </Text><FaExternalLinkAlt />
                                    </HStack>
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>
                    </HStack>

                    <Box
                        mt={3}
                        p={4}
                        borderRadius={"12px"}
                        border={"0.1px solid rgba(50, 143, 93, 0.2)"}
                        position="relative"
                        overflow="hidden"
                    >

                        <Box
                            position="absolute"
                            top="0"
                            left="0"
                            right="0"
                            bottom="0"
                            bg={colorMode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
                            borderRadius={"12px"}
                            backdropFilter="blur(12px)"
                            zIndex="-1"
                        />

                        <Center>
                            <VStack
                                justifyContent={"space-between"}
                                w="100%">
                                <Heading opacity={'0.9'} size={"lg"} fontWeight={'semibold'} textAlign={"center"}>{_roundedBalance !== null ? `${_roundedBalance} ${tokenName}` : `0 `}</Heading>


                                <HStack justifyContent={"center"} spacing={5} pt={6}>

                                    <VStack alignItems={"center"}>
                                        <Button
                                            _hover={{
                                                bg: "#2f855a",
                                                color: "white"
                                            }}
                                            _active={{
                                                bg: "#2f855a",
                                                color: "white"
                                            }}
                                            _focus={{
                                                bg: "#2f855a",
                                                color: "white"
                                            }}
                                            rounded={"full"}
                                            onClick={() => {
                                                setView("send");
                                                setSelectedToken(tokenName);
                                                setContractAddress(tokenAddr)
                                            }
                                            }
                                            color="white" bg="#2f855a"
                                        ><RiSendPlane2Line fontSize="30px" /></Button>
                                        <Text fontSize={"sm"}>Send</Text>
                                    </VStack>

                                    <VStack alignItems={"center"}>
                                        <Button

                                            rounded={"full"}
                                            onClick={() => {
                                                setView("savings");
                                                setSelectedToken(tokenName);
                                            }
                                            }
                                            color="white"
                                            bg="#2f855a"
                                            _hover={{
                                                bg: "#2f855a",
                                                color: "white"
                                            }}
                                            _active={{
                                                bg: "#2f855a",
                                                color: "white"
                                            }}
                                            _focus={{
                                                bg: "#2f855a",
                                                color: "white"
                                            }}
                                        ><FaPiggyBank fontSize="30px" /></Button>
                                        <Text fontSize={"sm"}>Savings</Text>
                                    </VStack>

                                </HStack>
                            </VStack>
                        </Center>
                    </Box >


                </>
            );

        case "savings":
            if (optedIn && optedIn.length > 0 && optedIn != ethers.ZeroAddress && !pool) {
                getPoolDetails();
            }
            return (
                <>

                    {!fetchingSavings && !optedIn && (
                        <>
                            <HStack mb={4} justifyContent={"space-between"} alignItems={"center"}>

                                <Flex>
                                    <Image
                                        h="30px"
                                        w="auto"
                                        src={logo}
                                        alt="kite logo"
                                    />
                                    <Heading pl={2} fontSize="24px">
                                        Opt in
                                    </Heading>
                                </Flex>
                                <Box

                                    onClick={() => {
                                        setView("home");
                                        setFetchingSavings(true)
                                        setStrategy("")
                                        setSelectedClone("")
                                        setSelectedDate(new Date());
                                        setMethod("")
                                        setClones(null);
                                        setOptedIn(null)
                                    }

                                    }
                                    as="button" fontSize={"sm"} color="red.500">cancel</Box>
                            </HStack>

                            <Box
                                mt={3}
                                p={4}
                                borderRadius={"12px"}
                                border={"0.1px solid rgba(50, 143, 93, 0.2)"}
                            >
                                <Select
                                    h="60px"
                                    value={strategy} onChange={(e) => setStrategy(e.target.value)}>
                                    <option value=""
                                        disabled
                                        // selected 
                                        hidden
                                    >
                                        Choose Savings Strategy
                                    </option>
                                    {strategies && strategies.map((_strategy, i) => (
                                        <option key={i} value={i}
                                            style={{
                                                fontSize: "bold"
                                            }}
                                        >
                                            {_strategy.name}
                                        </option>
                                    ))}
                                </Select>
                            </Box>

                            {strategy.length > 0 && (

                                <motion.div
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Box
                                        mt={3}
                                        p={4}
                                        borderRadius={"12px"}
                                        border={"0.1px solid rgba(50, 143, 93, 0.2)"}
                                    >
                                        <Center>
                                            {!fetchingSavings && clones && clones.length > 0 && (
                                                <VStack>
                                                    <Box>
                                                        <FormLabel fontSize={"xs"}>Savings Pool</FormLabel>
                                                        <Select
                                                            h="60px"
                                                            value={selectedClone}
                                                            onChange={(e) => setSelectedClone(e.target.value)}
                                                        >
                                                            <option disabled value="" hidden>Select clone</option>
                                                            {clones.map((clone, index) => (
                                                                <option
                                                                    //    selected={true}
                                                                    key={index} value={clone}>
                                                                    {clone}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                    </Box>


                                                    <Box w='100%'>
                                                        <FormLabel fontSize={"xs"}>Date Cap</FormLabel>
                                                        <Input
                                                            h="60px"
                                                            type="date"
                                                            value={selectedDate.toISOString().split('T')[0]}
                                                            onChange={handleDateChange} min={new Date().toISOString().split('T')[0]} />
                                                        <Text
                                                            color={"#06b670"}
                                                            fontStyle={"italic"}
                                                            py={2}
                                                            fontWeight={"semibold"}
                                                            fontSize={"xs"}
                                                        >{Math.max(1, Math.ceil((selectedDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)))} days lock period</Text>
                                                    </Box>


                                                    <Button
                                                        w="100%"
                                                        bg="#66b473"
                                                        color="white"
                                                        _hover={{
                                                            bg: "#66b473",
                                                            color: "white"
                                                        }}
                                                        _active={{
                                                            bg: "#66b473",
                                                            color: "white"
                                                        }}
                                                        _focus={{
                                                            bg: "#66b473",
                                                            color: "white"
                                                        }}
                                                        mt={6}
                                                        h="55px"
                                                        fontSize={"lg"}
                                                        borderRadius={"12px"}
                                                        isDisabled={
                                                            selectedClone.length < 1 ? true :
                                                                strategy.length < 1 ? true : false
                                                        }
                                                        onClick={handleOptIn}
                                                    >
                                                        Continue
                                                    </Button>




                                                </VStack>

                                            )}

                                            {!fetchingSavings && clones && clones.length < 1 && (
                                                <Text
                                                    textAlign={"center"}
                                                    fontWeight={"semibold"}
                                                    opacity={0.5}
                                                    px={3}
                                                    fontSize={"sm"}>You have no existing pool inheriting the {strategies[parseInt(strategy)].name} strategy</Text>
                                            )}

                                            {fetchingSavings && (
                                                <Spinner />
                                            )}
                                        </Center>

                                        {!fetchingSavings && clones && clones.length < 1 && (
                                            <Box mt={8}>

                                                <Center>
                                                    <Button
                                                        bg="green.200"
                                                        color={"#06b670"}
                                                        rightIcon={<FiUpload />}
                                                        onClick={handleCreatePool}
                                                    >Create New Pool</Button>
                                                </Center>
                                            </Box>
                                        )}
                                    </Box>
                                </motion.div >
                            )}
                        </>

                    )}

                    {fetchingSavings &&
                        <Center pt={12}>
                            <Spinner />
                        </Center>
                    }

                    {!fetchingSavings && optedIn && optedIn.length > 1 && optedIn != ethers.ZeroAddress && (
                        <>

                            <HStack my={3} mb={4} justifyContent={"space-between"} alignItems={"center"}>
                                <Flex align={"center"}>

                                    <IconButton
                                        onClick={() => {
                                            setPool(null);
                                            setView("token");
                                        }}
                                        icon={<BiChevronLeft />} aria-label={"back-to-home"} />
                                    <Heading pl={2} fontSize="18px"
                                        opacity={0.8}
                                    >
                                        Savings
                                    </Heading>
                                </Flex>

                                <Popover>
                                    <PopoverTrigger>
                                        <Button
                                            bg='transparent'
                                        ><FaEllipsisV /></Button>
                                    </PopoverTrigger>
                                    <PopoverContent w="fit-content">
                                        <PopoverArrow />
                                        <PopoverBody w="fit-content">
                                            <HStack display={"flex"} spacing={2} alignItems="center" fontSize={"xs"} fontWeight={"semibold"}>
                                                <Text>Inspect Contract </Text><FaExternalLinkAlt />
                                            </HStack>
                                        </PopoverBody>
                                    </PopoverContent>
                                </Popover>

                            </HStack>

                            {!pool && (
                                <>
                                    <Center>
                                        <Spinner />
                                    </Center>
                                </>
                            )}

                            {pool && (
                                <>

                                    <Box
                                        mt={3}
                                        p={4}
                                        borderRadius={"12px"}
                                        border={"0.1px solid rgba(50, 143, 93, 0.2)"}
                                    >
                                        <Center>
                                            <VStack
                                                justifyContent={"space-between"}
                                                w="100%">


                                                <Heading opacity={'0.9'} size={"lg"} fontWeight={'semibold'} textAlign={"center"}> {pool.totalSupply} {selectedToken}</Heading>

                                                <HStack justifyContent={"center"} spacing={5} pt={6}>

                                                    <VStack alignItems={"center"}>
                                                        <Button
                                                            p={0}
                                                            w="40px"
                                                            h="40px"
                                                            _hover={{
                                                                bg: "#2f855a",
                                                                color: "white"
                                                            }}
                                                            _active={{
                                                                bg: "#2f855a",
                                                                color: "white"
                                                            }}
                                                            _focus={{
                                                                bg: "#2f855a",
                                                                color: "white"
                                                            }}
                                                            rounded={"full"}
                                                            onClick={() => {
                                                                setView("send");
                                                                // setSelectedToken(tokenName);
                                                            }
                                                            }
                                                            color="white" bg="#2f855a"
                                                        ><RiAddCircleLine size="30px" /></Button>
                                                        <Text fontSize={"xs"}>Increase Cap</Text>
                                                    </VStack>

                                                    <VStack alignItems={"center"}>
                                                        <Button
                                                            w="40px"
                                                            h="40px"
                                                            p={0}
                                                            _hover={{
                                                                bg: "#2f855a",
                                                                color: "white"
                                                            }}
                                                            _active={{
                                                                bg: "#2f855a",
                                                                color: "white"
                                                            }}
                                                            _focus={{
                                                                bg: "#2f855a",
                                                                color: "white"
                                                            }}
                                                            rounded={"full"}
                                                            onClick={() => {
                                                                setView("claims");
                                                            }
                                                            }
                                                            color="white" bg="#2f855a"
                                                        ><FaGift size="30px" /></Button>
                                                        <Text fontSize={"xs"}>Claims</Text>
                                                    </VStack>

                                                    <VStack alignItems={"center"}>
                                                        <Button
                                                            p={0}
                                                            w="40px"
                                                            h="40px"
                                                            rounded={"full"}
                                                            onClick={() => {
                                                                setView("savings");
                                                                setSelectedToken(tokenName);
                                                            }
                                                            }
                                                            color="white"
                                                            bg="#2f855a"
                                                            _hover={{
                                                                bg: "#2f855a",
                                                                color: "white"
                                                            }}
                                                            _active={{
                                                                bg: "#2f855a",
                                                                color: "white"
                                                            }}
                                                            _focus={{
                                                                bg: "#2f855a",
                                                                color: "white"
                                                            }}
                                                            isDisabled={true}
                                                        ><RiSubtractLine size="30px" /></Button>
                                                        <Text
                                                            opacity={0.6}
                                                            fontSize={"xs"}>Withdraw</Text>
                                                    </VStack>

                                                </HStack>
                                            </VStack>
                                        </Center>
                                    </Box>



                                    <VStack mt={3} justifyContent={"center"} w="100%">

                                        <Divider py={3} />

                                        <Flex fontSize={"xs"} h="100%" alignItems={"center"} w="100%">
                                            <Box>
                                                <Text fontWeight={"semibold"}>Address: </Text>
                                            </Box>
                                            <Box
                                                ml={2}
                                                p={2}
                                                onClick={() => {
                                                    setShowTooltip(!showTooltip);
                                                    setTimeout(() => {
                                                        setShowTooltip(false);
                                                    }, 1000)

                                                }
                                                }
                                                borderRadius={"10px"}
                                                bg={colorMode === "light" ? "blackAlpha.100" : "whiteAlpha.100"}
                                            >{shortenAddress(pool.address)}</Box>
                                            {showTooltip && <Tooltip label="Copied"
                                                isOpen={showTooltip} placement="top"><Box /></Tooltip>}
                                        </Flex>

                                        <Flex fontSize={"xs"} h="100%" alignItems={"center"} w="100%">
                                            <Box>
                                                <Text fontWeight={"semibold"}>Status: </Text>
                                            </Box>
                                            <Box
                                                ml={2}
                                                fontWeight="bold"
                                                borderRadius={"10px"}
                                                color={colorMode === "light" ? "green" : "white"}
                                            >{pool.status} </Box>
                                        </Flex>

                                        <Flex fontSize={"xs"} h="100%" alignItems={"center"} w="100%">
                                            <Box>
                                                <Text fontWeight={"semibold"}>Unlock Target: </Text>
                                            </Box>
                                            <Box
                                                ml={2}
                                                textDecoration={"underline"}
                                                fontWeight="bold"
                                                borderRadius={"10px"}
                                            >{pool.unlock}</Box>
                                        </Flex>
                                    </VStack>

                                </>
                            )}

                        </>
                    )}


                </>
            )

        default:
            return <Box> View Error</Box>;
    }
};

export default HomeView;
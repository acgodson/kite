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







const HomeView = () => {
    const navigate = useNavigate();
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
    } = useAppContext();
    const [view, setView] = useState("home");
    const [price, setPrice] = useState<number | any>(0);
    const userAddress = activeAccount?.address;
    const [strategy, setStrategy] = useState("");
    const [clones, setClones] = useState<string[] | null>();
    const [fetching, setFetching] = useState(true);
    const [selectedClone, setSelectedClone] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [optedIn, setOptedIn] = useState<any | null>(null);
    const { colorMode } = useColorMode();
    const apiUrl = `https://pegasus.lightlink.io/api/v2/addresses/${userAddress}/transactions?filter=from`;
    const priceApiKey = "44acbe2f2d147775185a828cf204ca20136e149a338310e0c09cd3176876cba0";
    const [pool, setPool] = useState<any | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [sortedTransactions, setSortedTransactions] = useState<Record<string, any[]>>({});



    const fetchClonesByStrategy = async () => {
        const chain = PegasusRPC
        const privateKey = activeAccount?.privateKey;
        if (!privateKey) {
            return;
        }
        try {
            setFetching(true);
            const provider = new ethers.JsonRpcProvider(chain);
            const connectedWallet = new Wallet(privateKey, provider);
            const abi = KiteArtifact.abi;
            const contractAddress = KiteContract;
            const contract = new ethers.Contract(contractAddress, abi, connectedWallet);
            const _clones = await contract.getPoolsByStrategies(strategies[parseInt(strategy)].address);
            console.log("found clones", _clones);
            setClones(_clones)
            setFetching(false);
            return _clones;
        } catch (e) {
            console.log("error fetching clones", e);
            setBalance(0);
            setPrice(0);
            setFetching(false);
        }
    }

    const fetchClonesByTokens = async () => {
        const chain = PegasusRPC
        const privateKey = activeAccount?.privateKey;
        const tokenAddress = tokens?.filter((x: Asset) => x.token.symbol === selectedToken)[0].token.address
        if (!privateKey) {
            return;
        }
        try {
            console.log("checking for this token", tokenAddress)
            const provider = new ethers.JsonRpcProvider(chain);
            const connectedWallet = new Wallet(privateKey, provider);
            const abi = KiteArtifact.abi;
            const contractAddress = KiteContract;
            const contract = new ethers.Contract(contractAddress, abi, connectedWallet);
            const _pool = await contract.getPoolByToken(tokenAddress);
            if (_pool && _pool !== ethers.ZeroAddress) {
                setOptedIn(_pool);
            } else {
                setOptedIn(null)
            }
            setFetching(false);
            // return _pool;
        } catch (e) {
            console.log("error fetching clones", e);
            setBalance(0);
            setPrice(0);
            setFetching(false);
        }
    }

    const mockTest = async () => {
        const chain = PegasusRPC;
        const privateKey = activeAccount?.privateKey;
        // console.log(privateKey);
        if (!privateKey) {
            return;
        }
        try {
            const _method = "setKiteStrategy";
            const _param = ["0x057e8e2bC40ECff87e6F9b28750D5E7AC004Eab9"];
            const provider = new ethers.JsonRpcProvider(chain);
            const connectedWallet = new Wallet(privateKey, provider);
            const abi = KiteArtifact.abi;
            const contract = new ethers.Contract(KiteContract, abi, connectedWallet);
            const data = contract.interface.encodeFunctionData(_method, _param);
            const transaction = {
                to: KiteContract,
                data: data,
                value: 0,
            };
            const tx = await connectedWallet.sendTransaction(transaction);
            const txn = await tx.wait();
            // console.log(txn);
            if (txn && txn.status === 1) {
                console.log(txn.hash);
            }
        } catch (e) {

        }
    }



    const fetchTokens = async () => {
        const chain = PegasusRPC; //chains_config[selectedChain]
        const address = activeAccount?.address;
        if (!address) {
            return;
        }
        const apiUrl = `https://pegasus.lightlink.io/api/v2/addresses/${address}/tokens?type=ERC-20%2CERC-721%2CERC-1155`;
        const priceApiKey = "44acbe2f2d147775185a828cf204ca20136e149a338310e0c09cd3176876cba0";

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            console.log(data);
            if (response.ok) {
                const erc20Tokens: any = data.items.filter((token: Asset) => token.token.type === "ERC-20");
                for (const token of erc20Tokens) {
                    if (token.token.exchange_rate === null) {
                        const priceInUSD = await fetchCryptoPriceInUSD(token.token.symbol, priceApiKey);
                        token.token.exchange_rate = priceInUSD;
                    }
                    if (token.token.icon_url === null) {
                        token.token.icon_url = logo; // Replace with your default icon URL
                    }
                }
                erc20Tokens.forEach((token: Asset) => {
                    console.log(`Name: ${token.token.name}`);
                    console.log(`Address: ${token.token.address}`);
                    console.log(`Balance: ${token.value}`);
                    console.log(`Exchange Rate: ${token.token.exchange_rate}`);
                    console.log("---");
                });
                setTokens(erc20Tokens);
            } else {
                console.error(`Failed to fetch data. Status code: ${response.status}`);
            }
        } catch (error: any) {
            console.error("Error during fetch:", error.message);
        }
    };


    const getBalance = async () => {
        const chain = PegasusRPC  //chains_config[selectedChain]
        const privateKey = activeAccount?.privateKey;
        console.log(privateKey);
        if (!privateKey) {
            return;
        }
        try {
            const provider = new ethers.JsonRpcProvider(chain);
            const connectedWallet = new Wallet(privateKey, provider);
            const balance = await connectedWallet.provider?.getBalance(activeAccount.address);
            console.log("Balance:", balance?.toString());
            //fix this
            const roundedBalance = parseFloat(ethers.formatEther(balance as any)).toFixed(Math.max(2, balance?.toString().split(".")[1]?.length || 0))
            setBalance(parseFloat(roundedBalance));
            const _price = await fetchCryptoPriceInUSD("ETH", priceApiKey);
            console.log("price", _price);
            const value = _price * Number(roundedBalance);
            setPrice(parseFloat(value.toFixed(2).toString()));
        } catch (e) {
            console.log("error fetching balance", e)
            setBalance(0);
            setPrice(0);
        }

    }

    const getPoolDetails = async () => {
        const chain = PegasusRPC  //chains_config[selectedChain]
        const privateKey = activeAccount?.privateKey;
        if (!privateKey || !optedIn) {
            return;
        }
        try {
            const provider = new ethers.JsonRpcProvider(chain);
            const connectedWallet = new Wallet(privateKey, provider);
            const erc20Abi = [
                "function balanceOf(address owner) view returns (uint256)"
            ];
            const poolAbi = [
                "function getTokenDetails(address token) external view returns (bool, uint256)",
                "function getShareholders(address token) external view returns (address[] memory, uint256[] memory)"
            ];

            const tokenAddress = tokens?.filter((x: Asset) => x.token.symbol === selectedToken)[0].token.address
            const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
            const poolContract = new ethers.Contract(optedIn, poolAbi, provider);

            // Get pool details
            const [isActive, unlockTimestamp] = await poolContract.getTokenDetails(tokenAddress);

            const unlockDate = new Date(Number(unlockTimestamp) * 1000); // Ensure timestamp is in milliseconds
            const formattedUnlockDate = unlockDate.toLocaleDateString('en-US', {
                day: "numeric",
                month: 'long',
                year: 'numeric'
            });
            console.log(formattedUnlockDate)
            const totalSupply = await tokenContract.balanceOf(optedIn);
            const formattedTotalSupply = ethers.formatEther(totalSupply);
            const [addresses, shares] = await poolContract.getShareholders(tokenAddress);

            let myShare = 0;
            const index = addresses.findIndex((address: string) => address.toLowerCase() === userAddress?.toLowerCase());
            if (index !== -1) {
                myShare = parseFloat(ethers.formatEther(shares[index]));
            }

            const _pool = {
                address: optedIn,
                status: isActive ? "Active" : "Inactive",
                unlock: formattedUnlockDate,
                totalSupply: formattedTotalSupply,
                myShare: myShare
            };

            if (_pool) {
                console.log("pool details", _pool)
                setPool(_pool)
            }
            return _pool;
        } catch (e) {
            console.log("error fetching balance", e)
            setBalance(0);
            setPrice(0);
        }

    }


    const handleCreatePool = async () => {
        //cloning a strategy to create a new pool
        setContractAddress(KiteContract);
        setMethod("create");
        const _params = [
            strategies[parseInt(strategy)].address,
            [tokens?.filter((x: Asset) => x.token.symbol === selectedToken)[0].token.address]]
        setParams(_params)
        console.log("params for creating pool", _params);
        navigate("/confirm")
    }

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = new Date(event.target.value);
        const today = new Date();
        const timeDiff = selected.getTime() - today.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        // Ensure the minimum date is the next day
        const minDate = new Date(today);
        minDate.setDate(minDate.getDate() + 1);

        if (selected < minDate) {
            setSelectedDate(minDate);
        } else {
            setSelectedDate(selected);
        }
    };


    const handleOptIn = () => {
        setContractAddress(KiteContract);
        setMethod("optIn");

        const _index: any = tokens?.findIndex((token: Asset) => token.token.symbol === selectedToken);
        const _tokenBal: string = tokens![_index].value;
        const _bal = parseFloat((ethers.formatEther(_tokenBal!.toString())));

        setAmount(_bal.toString());
        const __days = Math.max(1, Math.ceil((selectedDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
        const daysInSeconds = __days * 24 * 60 * 60;
        //Pool,token,lockPeriod or amount
        const __params: any = [
            ethers.getAddress(selectedClone),
            tokens?.filter((x: Asset) => x.token.symbol === selectedToken)[0].token.address,
            ethers.parseUnits(daysInSeconds.toString(), 0)
        ]
        setParams(__params)
        console.log("params for opting in to pool", __params);
        navigate("/confirm")
    }

    useEffect(() => {
        if (activeAccount?.address) {
            if (!balance) {
                getBalance();
            } if (!tokens) {
                fetchTokens();
            }
        }
    }, [activeAccount?.address, balance, tokens]);


    useEffect(() => {
        if (!fetching && strategy && !clones && !optedIn) {
            fetchClonesByStrategy();
        }
    }, [fetching, strategy, clones, optedIn]);


    useEffect(() => {
        if (view === "savings" && selectedToken && !optedIn && fetching) {
            fetchClonesByTokens();
        }

    }, [view, fetching, optedIn, selectedToken]);


    switch (view) {
        case "home":
            return (
                <>
                    <Box
                        p="4"
                        borderRadius={"12px"}
                        border={"0.1px solid rgba(50, 143, 93, 0.3)"}
                        bg="rgba(50, 143, 93, 0.1)"

                    // _before={{
                    //     content: '""',
                    //     position: "absolute",
                    //     top: 0,
                    //     left: 0,
                    //     right: 0,
                    //     bottom: 0,
                    //     bg: colorMode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                    //     backdropFilter: "blur(12px)",
                    //     borderRadius: "inherit",
                    // }}
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




                        {/* <Box
                            w="100%"
                            h="100%"
                            bg="whiteAlpha.700"
                            position={"absolute"}

                            sx={{
                                blur: "12px",
                                backdropBlur: "15px"
                            }}
                        /> */}
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
                                        onClick={mockTest}
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
                                            // w="40px"
                                            // h="40px"
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

                    {/* <Box mt={8}>
                        <Center>
                            <Text fontWeight={"bold"} opacity={0.3}>You have No Transactions</Text>
                        </Center>
                    </Box> */}


                </>
            );

        case "savings":
            if (optedIn && optedIn.length > 0 && optedIn != ethers.ZeroAddress && !pool) {
                getPoolDetails();
            }
            return (
                <>

                    {!fetching && !optedIn && (
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
                                        setFetching(true)
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
                                            {!fetching && clones && clones.length > 0 && (
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

                                            {!fetching && clones && clones.length < 1 && (
                                                <Text
                                                    textAlign={"center"}
                                                    fontWeight={"semibold"}
                                                    opacity={0.5}
                                                    px={3}
                                                    fontSize={"sm"}>You have no existing pool inheriting the {strategies[parseInt(strategy)].name} strategy</Text>
                                            )}

                                            {fetching && (
                                                <Spinner />
                                            )}
                                        </Center>

                                        {!fetching && clones && clones.length < 1 && (
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

                    {fetching &&
                        <Center pt={12}>
                            <Spinner />
                        </Center>
                    }

                    {!fetching && optedIn && optedIn.length > 1 && optedIn != ethers.ZeroAddress && (
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
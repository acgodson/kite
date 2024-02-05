import { Box, Heading, Flex, Icon, Image, Button, Text, HStack, Card, Divider, Tab, TabList, TabPanel, TabPanels, Tabs, useColorMode, Center, Avatar, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverTrigger, VStack } from "@chakra-ui/react";
import { Wallet, ethers } from "ethers";
import { FaExternalLinkAlt } from "react-icons/fa";
import { renderAvatar, shortenAddress } from "../utils/helpers";
import { BiRightArrowCircle } from "react-icons/bi";
import logo from "../assets/logo.webp";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../contexts/appContext";
import { useEffect, useState } from "react";
import { KiteContract, PegasusRPC } from "../utils/consts";
import KiteArtifact from "../utils/Kite.json";




const ConfirmSend = () => {
    const {
        showSplashScreen,
        accounts,
        setAccounts,
        activeAccount,
        setActiveAccount,
        recipient,
        setBalance,
        setTokens,
        setRecipient,
        selectedToken,
        amount,
        setAmount,
        setSelectedToken,
        contractAddress,
        setContractAddress,
        method,
        setMethod,
        params,
        setParams,
    } = useAppContext();
    const navigate = useNavigate();
    const { colorMode } = useColorMode();
    const [gasEstimate, setGasEstimate] = useState<string | null>(null);
    const [total, setTotal] = useState("");
    const [roundDownAmount, setroundDownAmount] = useState(0);
    const [txnObj, setTxnObj] = useState<any | null>(null);
    const [kiteApproval, setKiteApproval] = useState(false)
    const [queue, setQueue] = useState(false);
    const [edit, setEdit] = useState(false);
    const [value, setValue] = useState(amount);
    const [isSending, setIsSending] = useState(false);

    const editCap = async () => {
        setEdit(true)
    }
    const handleReject = async () => {
        setAmount("0")
        setRecipient("");
        setGasEstimate(null);
        setSelectedToken("ETH") //back to default
        setContractAddress(null);
        setMethod(null)
        setParams([])
        setKiteApproval(false)
        navigate("/home");
    }


    const estimateGas = async () => {
        const chain = PegasusRPC
        const privateKey = activeAccount?.privateKey;
        if (!privateKey) {
            return;
        }

        // return;
        try {
            // setFetching(true);
            const provider = new ethers.JsonRpcProvider(chain);
            const connectedWallet = new Wallet(privateKey, provider);
            //Create a transaction object
            const __transaction = !method ?
                {
                    to: recipient,
                    value: ethers.parseEther(amount.toString()), // Amount in Ether
                } : txnObj;


            console.log(method)
            console.log(__transaction);

            // Estimate the gas cost
            const gasLimit = await provider.estimateGas(__transaction);
            console.log("gas limit", gasLimit);
            const gas = ethers.formatEther(Number(gasLimit));
            const _total = Number(gas) + Number(amount);
            setGasEstimate(gas);
            setTotal(_total.toString());

        } catch (e) {
            console.log("error estimating gas", e)
        }

    }

    const BuildTxn = async () => {
        console.log("preparing to send transaction", {
            method: method,
            contract: contractAddress,
            params: params
        })
        const chain = PegasusRPC
        const privateKey = activeAccount?.privateKey;
        if (!privateKey) {
            return;
        }
        const provider = new ethers.JsonRpcProvider(chain);
        const connectedWallet = new Wallet(privateKey, provider);
        let data;
        let transaction;

        if (method && contractAddress) {
            const abi = KiteArtifact.abi;
            const _contractAddress = contractAddress;
            const contract = new ethers.Contract(_contractAddress, abi, connectedWallet);

            const methodName = method;
            const methodParams = params;

            if (params.length > 0) {
                data = contract.interface.encodeFunctionData(methodName, methodParams);
                transaction = {
                    to: contractAddress,
                    data: data,
                    value: 0,
                };
                console.log(data)
            }
        } else if (selectedToken !== "ETH") {
            const erc20Abi = ["function transfer(address to, uint amount) returns (bool)",];
            const tokenContract = new ethers.Contract(contractAddress!, erc20Abi, connectedWallet);
            const amountInWei = ethers.parseEther(amount);
            data = tokenContract.interface.encodeFunctionData("transfer", [recipient, amountInWei]);
            transaction = {
                to: contractAddress,
                data: data,
                value: 0,
            };
        } else {
            transaction = {
                to: recipient,
                value: ethers.parseEther(amount),
            };
        }

        console.log("Built Txn", transaction)
        setTxnObj(transaction);
    }

    useEffect(() => {
        // console.log(txnObj)
        // console.log(gasEstimate)
        if (txnObj && !gasEstimate) {
            estimateGas();
        }
    }, [
        txnObj, gasEstimate
    ]);


    useEffect(() => {
        if (!txnObj) {
            BuildTxn();
        }
    }, [])

    useEffect(() => {
        if (method === "optIn") {
            setKiteApproval(true)
        }
    }, [])



    const handleConfirm = async () => {

        const chain = PegasusRPC
        const privateKey = activeAccount?.privateKey;
        if (!privateKey) {
            return;
        }
        const provider = new ethers.JsonRpcProvider(chain);
        const connectedWallet = new Wallet(privateKey, provider);

        try {
            setIsSending(true);
            if (kiteApproval) {
                console.log("this is happenng")

                const ERC20_ABI = [
                    {
                        "constant": false,
                        "inputs": [
                            {
                                "name": "_spender",
                                "type": "address"
                            },
                            {
                                "name": "_value",
                                "type": "uint256"
                            }
                        ],
                        "name": "approve",
                        "outputs": [
                            {
                                "name": "",
                                "type": "bool"
                            }
                        ],
                        "type": "function"
                    }
                ]
                const tokenContract = new ethers.Contract(params[1], ERC20_ABI, connectedWallet);
                const amountInWei = ethers.parseEther(amount);
                console.log(amountInWei);
                console.log(params[0]); //pool
                console.log(params[1]); //token
                console.log(contractAddress);

                const approvalTxResponse = await tokenContract.approve(params[0], amountInWei);
                const approvalTx = await approvalTxResponse.wait();
                if (approvalTx.status === 1) {
                    console.log("Approval successful");
                    setIsSending(false);
                    setQueue(false);
                } else {
                    console.error("Approval failed");
                    setIsSending(false);
                    return;
                }
            }


            const txResponse = await connectedWallet.sendTransaction(txnObj);
            const tx = await txResponse.wait()
            if (tx && tx.status === 1) {
                // Transaction succeeded
                const receipt = await provider.getTransactionReceipt(tx.hash);
                const transactionId = receipt; // You might want to use a different identifier
                console.log("Transaction ID:", transactionId);
                // Reset and Navigate to home or perform other actions
                setIsSending(false)
                setBalance(null);
                setTokens(null);
                navigate("/home");
            } else {
                setIsSending(false)
                console.error("Transaction failed");
            }
        } catch (e) {
            console.log("error sending txn", e)
            setIsSending(false)
        }

    }

    return (
        <Box>
            <Heading opacity={"0.8"} mt={3} px={4} fontSize="24px" mb={4}>
                {method ?
                    method === "approval" ? "Approval Request" :
                        ""
                    : "Confirm Transaction"}

            </Heading>

            {/* Send Transaction */}
            {!method && (
                <>
                    <Card
                        px={4}
                        pt={4}
                        borderLeft="none"
                        borderRight="none"
                        borderTop="0.1px solid"
                        borderBottom="0.1px solid"
                        borderRadius={"none"}
                        boxShadow={'none'}
                    >
                        <HStack align="center" justify="space-between" mb={4}>
                            {/* Display sender and recipient information */}
                            <Flex align="center">
                                <Avatar
                                    opacity={"0.7"}
                                    src={renderAvatar(activeAccount?.address!)}
                                    boxSize={6} mr={2} />
                                <Text fontSize={"sm"}>{`${shortenAddress(activeAccount?.address!)}`}</Text>
                            </Flex>
                            <Avatar

                                opacity={"0.7"}

                                as={BiRightArrowCircle} boxSize={6} mr={2} />
                            <Flex align="center">
                                <Avatar
                                    opacity={"0.7"} src={renderAvatar(recipient)}
                                    boxSize={6} mr={2} />
                                <Text fontSize={"sm"}>{`${shortenAddress(recipient)}`}</Text>
                            </Flex>
                        </HStack>
                    </Card>

                    {/* Display transaction details */}
                    <Box px={4} py={4} >
                        <Box
                            border="0.2px solid"
                            py={1}
                            px={3}
                            opacity={"0.9"}
                            w="fit-content"
                            borderRadius={"12px"}
                            fontStyle={"xs"}
                        >
                            Sending {selectedToken}
                        </Box>
                        <Text py={1} fontSize="2xl">{amount}</Text>
                    </Box>

                    {/* Display transaction breakdown */}
                    <Flex direction="column"
                        alignItems={"center"}
                        mb={4}>

                        {!method && selectedToken !== "ETH" && (
                            <HStack
                                w="fit-content"
                                bg="rgba(197, 255, 72, 0.3)"
                                fontSize={"xs"}
                                px={3}
                                fontWeight={'semibold'}
                                py={3}
                                borderLeft={"5px solid #c5ff48"}
                            >
                                <Image
                                    h="30px"
                                    w="auto"
                                    src={logo}
                                />

                                <Text>
                                    You can save to fractions from your transactions
                                </Text>

                            </HStack>
                        )}

                    </Flex>

                    {/* Display gas estimate and total */}
                    <Flex py={2} px={4} justifyContent={"space-between"}>
                        <Box>
                            <Box fontWeight={"bold"} mb={2} fontSize="sm">
                                Gas <span style={{
                                    opacity: "0.7",
                                    fontWeight: "normal"
                                }}><em>(estimated)</em></span>
                            </Box>
                            <Text fontWeight={"bold"} color={"#06b670"} fontSize="sm">
                                Likely in {"<"} 30 seconds
                            </Text>
                        </Box>
                        <Box>
                            <Text fontWeight={"bold"} fontSize="sm">
                                {gasEstimate}ETH</Text>
                        </Box>

                    </Flex>

                    <Box px={8} py={4}>
                        <Divider />
                    </Box>

                    <Flex py={2} px={4} justifyContent={"space-between"}>
                        <HStack alignItems={"center"} w="100%" justifyContent={"space-between"}>
                            <Box mb={2} fontSize="sm">
                                <Text fontWeight={"bold"}>  Total   </Text>
                                <Text fontWeight={"bold"} opacity={"0.8"}>  Amount + gas fee   </Text>
                            </Box>
                            <Box mb={2} fontSize="sm">
                                <Text fontWeight={"bold"}> {amount}{selectedToken}  +  </Text>
                                <br />
                                <Text fontWeight={"bold"} opacity={"0.8"}> {gasEstimate}{"ETH"}  </Text>
                            </Box>

                        </HStack>
                    </Flex>
                </>
            )}


            {/* Contract Interaction */}
            {method && !kiteApproval && method !== "approve" && (
                <>
                    <Card
                        px={4}
                        pt={4}
                        borderLeft="none"
                        borderRight="none"
                        borderTop="0.1px solid"
                        borderBottom="0.1px solid"
                        borderRadius={"none"}
                        boxShadow={'none'}
                    >
                        <HStack align="center" justify="space-between" mb={4}>
                            {/* Display sender and recipient information */}
                            <Flex align="center">
                                <Avatar
                                    opacity={"0.7"}
                                    src={renderAvatar(activeAccount?.address!)}
                                    boxSize={6} mr={2} />
                                <Text fontSize={"sm"}>{`${shortenAddress(activeAccount?.address!)}`}</Text>
                            </Flex>
                            <Icon opacity={"0.7"} as={BiRightArrowCircle} boxSize={6} mr={2} />
                            <Flex align="center">
                                <Avatar
                                    opacity={"0.7"}
                                    src={renderAvatar(contractAddress!)}
                                    boxSize={6} mr={2} />
                                <Box>
                                    <Text fontSize={"sm"} fontWeight={"semibold"}>Contract</Text>
                                    <Text fontSize={"sm"}>{`${shortenAddress(contractAddress!)}`}</Text>
                                </Box>
                            </Flex>
                        </HStack>
                    </Card>


                    {/* Display transaction details */}
                    <Box px={4} py={4} >
                        <Box
                            border="0.2px solid"
                            py={1}
                            px={3}
                            opacity={"0.9"}
                            w="fit-content"
                            borderRadius={"12px"}
                            fontStyle={"xs"}
                            bg={colorMode === "light" ? "whitesmoke" : "transparent"}
                        >
                            {method}
                        </Box>
                    </Box>

                    <Tabs
                        h="250px"
                        colorScheme="green" variant="enclosed-colored" isFitted>
                        <TabList>
                            <Tab>
                                <Text>Details</Text>
                            </Tab>
                            <Tab>
                                <Center>
                                    <Text fontWeight={"semibold"} fontSize={"sm"}>Data</Text>
                                </Center>
                            </Tab>
                        </TabList>


                        <TabPanels pt={12}>

                            {/* Txn Details */}
                            <TabPanel>
                                <>
                                    {/* Display gas estimate and total */}
                                    <Flex py={2} px={4} justifyContent={"space-between"}>
                                        <Box>
                                            <Box fontWeight={"bold"} mb={2} fontSize="sm">
                                                Gas <span style={{
                                                    opacity: "0.7",
                                                    fontWeight: "normal"
                                                }}><em>(estimated)</em></span>
                                            </Box>
                                            <Text fontWeight={"bold"} color={"#06b670"} fontSize="sm">
                                                Likely in {"<"} 30 seconds
                                            </Text>
                                        </Box>
                                        <Box>
                                            <Text fontWeight={"bold"} fontSize="sm">
                                                {gasEstimate}ETH</Text>
                                        </Box>

                                    </Flex>

                                    <Box px={8} py={4}>
                                        <Divider />
                                    </Box>
                                </>
                            </TabPanel>

                            {/* Data, HEX */}
                            <TabPanel>
                                {/* <Box>data would appear here</Box> */}
                                <Card
                                    fontSize={"xs"}
                                    boxShadow={"none"}
                                    border={"none"}
                                    p={4}>
                                    {txnObj && txnObj.data}
                                </Card>
                            </TabPanel>

                        </TabPanels>
                    </Tabs>

                </>

            )}



            {/* Approve Spending (Erc-20 Allowance) */}
            <>
                {method && method === "approve" || kiteApproval && (
                    <>

                        <Flex justify={"center"}>
                            <HStack
                                w="fit-content"
                                bg="rgba(197, 255, 72, 0.3)"
                                fontSize={"xs"}
                                px={3}
                                fontWeight={'bold'}
                                py={3}
                                borderRadius={"15px"}
                                alignSelf={"center"}

                            >
                                <Image
                                    h="30px"
                                    w="auto"
                                    src={logo}
                                />

                                <Text>
                                    Kite Protocol
                                </Text>

                            </HStack>

                        </Flex>

                        <Heading mt={4} pl={2} fontSize="18px"
                            textAlign={"center"}
                        >
                            Spending Cap Request for Your
                        </Heading>

                        <Box mt={2}>
                            <HStack justifyContent={"center"} alignItems={"center"}>
                                <Box
                                    h='30px'
                                    w="30px"
                                    bg="#333"
                                    as="img"
                                    src={renderAvatar(params[1])}
                                    rounded={"full"}
                                />
                                <Heading pl={2}
                                    opacity={0.6}
                                    fontSize="24px">
                                    {selectedToken}
                                </Heading>
                            </HStack>
                        </Box>

                        <Box mt={2}>
                            <Popover
                            >
                                <PopoverTrigger>
                                    <HStack
                                        cursor={"pointer"}
                                        py={2} justifyContent={"center"}
                                    >
                                        <Text
                                            color="blue.500"
                                            textDecor={"underline"}
                                            fontSize={"xs"}>View Savings Pool details</Text>
                                    </HStack>
                                </PopoverTrigger>

                                <PopoverContent
                                // maxH="400px"
                                >
                                    <PopoverArrow />
                                    <PopoverCloseButton color="red.500" />
                                    {/* <PopoverHeader>Details</PopoverHeader> */}
                                    <PopoverBody fontSize={"xs"}>
                                        <Box w="100%">

                                            <Text pt={4} pb={2}>Token Contract</Text>
                                            <Flex align={"center"} justify={"space-between"}>
                                                <Flex>
                                                    <Avatar
                                                        src={renderAvatar(params[1])}
                                                        h="30px" w="30px" />

                                                    <Box ml={3}>
                                                        <Text fontWeight={"semibold"} fontSize={"sm"} >{selectedToken}</Text>
                                                        <Text
                                                            fontSize={"xs"}
                                                        >{shortenAddress(params[1])}</Text>
                                                    </Box>
                                                </Flex>
                                                <Box>
                                                    <FaExternalLinkAlt />
                                                </Box>
                                            </Flex>

                                            <Text pt={4} pb={2}>Savings Pool</Text>
                                            <Flex align={"center"} justify={"space-between"}>
                                                <Flex>
                                                    <Avatar
                                                        src={renderAvatar(params[0])}
                                                        h="30px" w="30px" />

                                                    <Box ml={3}>
                                                        <Text fontSize={"sm"} >{"Safe Lock"}</Text>
                                                        <Text
                                                            fontSize={"xs"}
                                                        >{shortenAddress(params[0])}</Text>
                                                    </Box>
                                                </Flex>
                                                <Box>
                                                    <FaExternalLinkAlt />
                                                </Box>
                                            </Flex>



                                        </Box>
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>
                        </Box>


                        <Box p={4}>
                            <Card mt={4} p={4}>
                                <HStack alignItems={"flex-start"} justifyContent={"space-between"}>
                                    <Box fontSize={"sm"}>
                                        <Text fontWeight={"bold"}>Requested spending cap</Text>
                                        <Text fontWeight={"bold"}> {amount} {selectedToken}</Text>
                                    </Box>
                                    <Box>
                                        <Box as="button"
                                            onClick={editCap}
                                            color="blue.500"
                                            fontWeight={"semibold"}>Edit </Box>

                                    </Box>
                                </HStack>
                            </Card>


                            <Box p={4}>
                                <HStack alignItems={"flex-start"} justifyContent={"space-between"}>
                                    <Box>
                                        <Text fontWeight={"bold"}>Transaction  fee</Text>
                                        {/* <Text> {amount} {selectedToken}</Text> */}
                                    </Box>
                                    <Box>
                                        <Text fontWeight={"semibold"}>0.00 </Text>
                                    </Box>
                                </HStack>
                            </Box>

                        </Box>

                    </>
                )}
            </>


            {/* <Divider /> */}

            {/* Action buttons */}
            <Flex justify="space-between" mt={8}
                px={4}
                alignItems={"center"}
            >
                <Button colorScheme="red"
                    h={"60px"}
                    w="150px"
                    borderRadius={"30px"}
                    // isDisabled={gasEstimate.length < 1 ? true : false}
                    onClick={handleReject}
                >
                    Reject
                </Button>
                <Button
                    colorScheme="green"
                    h={"60px"}
                    w="150px"
                    borderRadius={"30px"}
                    // isDisabled={!gasEstimate || gasEstimate && gasEstimate.length < 1 ? true : false}
                    onClick={() => {
                        if (kiteApproval) {
                            setQueue(true);
                            setKiteApproval(false);
                        }
                        handleConfirm();
                    }}
                    isLoading={isSending}
                >
                    {kiteApproval ? "Approve " : "Confirm"}
                </Button>
            </Flex>
        </Box>
    );
};

export default ConfirmSend;

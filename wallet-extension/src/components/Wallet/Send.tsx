import { Box, Heading, FormControl, Text, FormLabel, Select, InputGroup, Input, Button, HStack, VStack, InputRightElement } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useAppContext } from "../../contexts/appContext";
import { Asset } from "../../utils/types";


const Send = (
    { tokens, selected, setSelectedToken, setView, balance }
        :
        {
            tokens: any, selected: string, setSelectedToken: any, setView: any, balance: string
        }) => {

    const tokensCopy = tokens ? [...tokens] : [];
    if (tokens && tokens.length > 0) {
        const _index: any = tokensCopy.findIndex((token: Asset) => token.token.symbol === selected);
        if (_index !== -1) {
            const customToken = tokensCopy.splice(_index, 1)[0];
            tokensCopy.unshift(customToken);
            console.log(tokensCopy);
        } else {
            const customToken: Asset = {
                token: {
                    address: "0",
                    circulating_market_cap: null,
                    decimals: "18",
                    exchange_rate: null,
                    holders: "1",
                    icon_url: "",
                    name: "Ethereum",
                    symbol: "ETH",
                    total_supply: "10000",
                    type: "erc-20"
                },
                token_id: "null",
                token_instance: "null",
                value: balance || "0"
            };
            tokensCopy.unshift(customToken);
            console.log(tokensCopy);
        }

    } else {
        const customToken: Asset = {
            token: {
                address: "0",
                circulating_market_cap: null,
                decimals: "18",
                exchange_rate: null,
                holders: "1",
                icon_url: "",
                name: "Ethereum",
                symbol: "ETH",
                total_supply: "10000",
                type: "erc-20"
            },
            token_id: "null",
            token_instance: "null",
            value: balance || "0"
        };
        tokensCopy.unshift(customToken);
        console.log(tokensCopy);
    }

    const {
        recipient,
        setRecipient,
        amount,
        setAmount
    } = useAppContext();

    const [index, setIndex] = useState(0)

    const navigate = useNavigate()

    const handleCancel = async () => {
        setView("home");
    }



    return (
        <Box p={4}
            h='600px'
        >
            <VStack h="100%" w="100%" alignItems={"space-between"}>

                <Box w="100%">
                    <HStack mb={4} justifyContent={"space-between"} alignItems={"center"}>
                        <Heading fontSize="24px">
                            Send Money
                        </Heading>
                        <Box

                            onClick={handleCancel}
                            as="button" fontSize={"sm"} color="red.500">cancel</Box>
                    </HStack>

                    {/* Recipient selection */}
                    <FormControl mb={4}>
                        <FormLabel color={"#37a169"} >Recipient Address</FormLabel>
                        <InputGroup>
                            <Input
                                pr={ethers.isAddress(recipient) ? 8 : 0}
                                border={ethers.isAddress(recipient) ? "0.5px solid #37a169" : "0.2px solid #37a169"}
                                borderRadius={ethers.isAddress(recipient) ? "18px" : "0"}
                                readOnly={ethers.isAddress(recipient) ? true : false}
                                h={ethers.isAddress(recipient) ? "70px" : "60px"}
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                placeholder="Enter address or ENS name"
                            />

                            {ethers.isAddress(recipient) && (
                                <InputRightElement>
                                    <Box
                                        onClick={() => setRecipient("")}
                                        as="button" fontSize={"xl"} color="#37a169" fontWeight={"semibold"}>x</Box>
                                </InputRightElement>
                            )}
                        </InputGroup>

                    </FormControl>
                </Box>

                {ethers.isAddress(recipient) && (
                    <VStack alignItems={"space-between"} sx={{ transition: "all 0.3s ease-in" }} w="100%">
                        <Box >
                            {/* Asset selection */}
                            <FormControl mb={4} display={"flex"}>
                                <FormLabel pr={12}>Asset</FormLabel>
                                <Select
                                    h="60px"
                                    value={tokensCopy[index].token.name} onChange={(e) => setIndex(parseInt(e.target.value))}>
                                    {tokensCopy.map((asset: Asset, i: number) => (
                                        <option key={i} value={i}
                                            style={{
                                                fontSize: "bold"
                                            }}
                                        >
                                            {asset.token.name}        {asset.token.symbol}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Amount input */}
                            <FormControl mb={4} display={"flex"}>
                                <FormLabel pr={8}>
                                    <Box>
                                        <Text>Amount</Text>
                                        <Button
                                            onClick={() =>

                                                // console.log(selected)
                                                setAmount(

                                                    selected === "ETH" ?
                                                        tokensCopy[index].value : parseFloat(ethers.formatEther(tokensCopy[index].value as any)).toFixed(Math.max(2, tokensCopy[index].value?.toString().split(".")[1]?.length || 0)))


                                            }
                                            mt={2} h="30px" bg="white" color="#37a169" borderRadius={"15px"} border="1px solid #37a169">Max</Button>
                                    </Box>
                                </FormLabel>
                                <Input
                                    h="60px"
                                    inputMode="decimal" // Helps mobile users by showing a numeric keyboard
                                    pattern="[0-9]*" 
                                    type="text" 
                                    value={amount} onChange={(e) => setAmount(e.target.value)}
                                />

                            </FormControl>

                        </Box>


                        <Box pt={12}>
                            {/* Next button */}
                            <Button
                                h={"50px"}
                                w="100%"
                                borderRadius={"30px"}
                                colorScheme="green" onClick={() => navigate("/confirm")}
                            >
                                Next
                            </Button>

                        </Box>

                    </VStack>
                )}

            </VStack>






        </Box>
    );
};

export default Send;

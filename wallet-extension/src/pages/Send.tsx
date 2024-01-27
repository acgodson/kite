import { Box, Heading, FormControl, Text, FormLabel, Select, InputGroup, Input, InputRightAddon, Button, HStack, VStack, InputRightElement } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../components/Tokens/MyTokens";
import { ethers } from "ethers";


// symbol: "ETH",
// name: "Ethereum",
// balance: 100000000000000,
// address: "",
// decimals: 18,
// price: 0

interface Asset {
    symbol: string,
    name: string,
    balance: number | BigInt, //we have to map and get the user's balance out of each of those assets
    address: string,
    decimals: number,
    price: number
}

const Send = ({ amount, recipient, setRecipient, index, setIndex, setAmount }: any) => {

    const navigate = useNavigate()

    const handleCancel = async () => {
        navigate("/home");
    }



    return (
        <Box p={4}
            h='600px'
        >
            <VStack h="100%" w="100%" alignItems={"space-between"}>

                <Box w="100%">
                    <HStack mb={4} justifyContent={"space-between"} alignItems={"center"}>
                        <Heading size="lg">
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
                                    value={tokens[index].name} onChange={(e) => setIndex(parseInt(e.target.value))}>
                                    {tokens.map((asset: Asset, i: number) => (
                                        <option key={i} value={i}>
                                            {asset.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Amount input */}
                            <FormControl mb={4} display={"flex"}>
                                <FormLabel pr={8}>
                                    <Box>
                                        <Text>Amount</Text>
                                        <Button mt={2} h="30px" bg="white" color="#37a169" borderRadius={"15px"} border="1px solid #37a169">Max</Button>
                                    </Box>
                                </FormLabel>
                                <Input
                                    h="60px"
                                    type="number" value={amount} onChange={(e) => setAmount(parseInt(e.target.value))}
                                />

                            </FormControl>

                        </Box>


                        <Box pt={12}>
                            {/* Next button */}
                            <Button
                                h={"60px"}
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

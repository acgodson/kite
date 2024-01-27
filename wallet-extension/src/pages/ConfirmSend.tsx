import { Box, Heading, Flex, Icon, Image, Button, Text, HStack, Card, Divider } from "@chakra-ui/react";
import { ethers } from "ethers";
import { FaArrowUp, FaUserCircle } from "react-icons/fa";
import { shortenAddress } from "../utils/helpers";
import { BiRightArrowCircle } from "react-icons/bi";
import logo from "../assets/logo.webp";
import { useNavigate } from "react-router-dom";





const ConfirmSend = ({ sender, recipient, token, amount, roundedUpAmount, gasEstimate, totalWithGas }:
    { sender: string, recipient: string, token: string, amount: number, roundedUpAmount: number, gasEstimate: number, totalWithGas: number }
) => {
    const navigate = useNavigate()

    const handleConfirm = async () => {
        navigate("/home");
    }


    return (
        <Box>
            <Heading opacity={"0.8"} px={4} size="lg" mb={4}>
                Confirm Transaction
            </Heading>

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
                        <Icon opacity={"0.7"} as={FaUserCircle} boxSize={6} mr={2} />
                        <Text fontSize={"sm"}>{`${shortenAddress(sender)}`}</Text>
                    </Flex>
                    <Icon opacity={"0.7"} as={BiRightArrowCircle} boxSize={6} mr={2} />
                    <Flex align="center">
                        <Icon opacity={"0.7"} as={FaUserCircle} boxSize={6} mr={2} />
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
                    Sending {token}
                </Box>
                <Text py={1} fontSize="2xl">{amount}</Text>
            </Box>

            {/* Display transaction breakdown */}
            <Flex direction="column"
                alignItems={"center"}
                mb={4}>

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
                        You are going to Save {roundedUpAmount} from this transaction
                    </Text>

                </HStack>
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
                        0.00123275ETH</Text>
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
                        <Text fontWeight={"bold"}> {amount}{token}  +  </Text>
                        <br />
                        <Text fontWeight={"bold"} opacity={"0.8"}> {gasEstimate}  </Text>
                    </Box>

                </HStack>
            </Flex>

            <Divider />


            {/* Action buttons */}
            <Flex justify="space-between" mt={8}
                px={4}
                alignItems={"center"}
            >
                <Button colorScheme="red"
                    h={"60px"}
                    w="150px"
                    borderRadius={"30px"}
                >
                    Reject
                </Button>
                <Button
                    colorScheme="green"
                    h={"60px"}
                    w="150px"
                    borderRadius={"30px"}
                    onClick={handleConfirm}
                >
                    Confirm
                </Button>
            </Flex>
        </Box>
    );
};

export default ConfirmSend;

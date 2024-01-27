

import AnimatedSpinner from "../components/AnimatedSpinner";
import { Box, Text, Grid, Image, VStack, Center, Card, Button, HStack, useColorMode } from "@chakra-ui/react";
import logo from "../assets/logo.webp"
import cover from "../assets/cover.png"
import { BiError } from 'react-icons/bi';
import { useNavigate } from "react-router-dom";



const Welcome = () => {
    const navigate = useNavigate();
    const { colorMode } = useColorMode()



    return (
        <Box
            maxW="400px"
            w="100%"
            h="600px"
            bgGradient="linear(to bottom, black, #1a2f2c)"
            textAlign="center"
            fontSize="xl">

            <Box
                position="absolute"
                bg={`url(${cover})`}
                h="50%"
                w="100%"
                backgroundPosition="center"
                bgSize="cover"
            />


            <VStack h="100%" justifyContent="center" pt={28} spacing={8}>

                <Box w="100%" py={8} px={5}>
                    <Card w="100%" pt={3} bg="#172927">
                        <Text opacity={0.7} color="#c7c9cf">Spend, Save Wisely 👋</Text>
                        <VStack
                            py={4}
                            w="100%"
                            px={4}
                            spacing={5}>
                            <Button
                                bg={"white"}
                                color={"black"}
                                _hover={{
                                    color: colorMode === "dark" ? "black" : "white"
                                }}
                                w="100%"
                                h="55px"
                                fontSize={"lg"}
                                onClick={() => navigate("/create")}
                            >Create New Wallet</Button>
                            <Button
                                w="100%"
                                h="55px"
                                fontSize={"lg"}
                                color="white"
                                bg="#66b473"
                                onClick={() => navigate("/import")}
                            >Import Wallet</Button>

                        </VStack>
                    </Card>

                </Box>

                <HStack>
                    <BiError size={24} color="orange" />
                    <Text fontSize={"xs"} color="white">Testnet Wallet. Proceed with Caution!</Text>
                </HStack>

            </VStack >



        </Box >
    );
};

export default Welcome;


import AnimatedSpinner from "../components/AnimatedSpinner";
import { Box, Text, Grid, Image, Textarea, VStack, Center, Card, Button, HStack, Heading, Input, InputGroup, InputRightElement, useToast } from "@chakra-ui/react";
import logo from "../assets/logo.webp"
import cover from "../assets/cover.png"
import { BiError } from 'react-icons/bi';
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { ethers } from "ethers";
import { shortenAddress } from "../utils/helpers";



const steps = [0, 1, 2];

const ImportAccount = ({ setWallet, setSeedPhrase }: any) => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [phrase, setPhrase] = useState<any>("");
    const [newWallet, setNewWallet] = useState("");
    const toast = useToast();

    function recoverWallet() {
        //TODO: perform proper validation
        if (!phrase || phrase.length < 5) {
            toast({
                title: 'Error, invalid seed phrase'
            })
            return
        }
        const wallet = ethers.Wallet.fromPhrase(phrase);
        if (wallet) {
            setSeedPhrase(phrase);
            setWallet(wallet.address);
            setNewWallet(wallet?.address)
        }
    }


    const togglePassword = () => {
        setShowPassword(!showPassword);
    }

    const handleCreate = () => {
        //TODO: confirm or store password


        //create nnemonic
        if (stepIndex === 1) {
            recoverWallet();
        }


        if (stepIndex < 2) {

            setStepIndex(stepIndex + 1);
            return
        }

        alert("well done");
    }



    return (
        <Box
            w="400px"
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            h={stepIndex === 2 ? "600px" : "560px"}
            px={4}
        >

            {stepIndex === 2 && (
                <Box w="100%" h="100%" pb={24} display={"flex"} flexDir={"column"} justifyContent={"space-between"}>
                    <Box mt={8}>

                        <HStack spacing={3}
                            justifyContent={"center"}
                            alignItems={"center"}
                            pb={3}
                            opacity={"0.8"}
                            color="#66b473"
                        >
                            <Box><Heading fontSize={"24px"}>Recovered Wallet</Heading></Box>
                        </HStack>

                        <Box
                            w="100%"
                            px="4"
                            pb={8}
                            borderRadius={"12px"}
                            border={"0.1px solid rgba(50, 143, 93, 0.3)"}
                        >
                            <Box w="100%">
                                <Button
                                    w="100%"
                                    bg={"rgba(50, 143, 93, 0.1)"}
                                    mt={4}
                                    h="60px"
                                    fontSize={"lg"}
                                    onClick={() => navigate("/home")}
                                >
                                    {shortenAddress(newWallet)}
                                </Button>
                            </Box>
                        </Box>
                    </Box>

                    <Box>
                        <Button
                            w="100%"
                            mt={4}
                            bg="#66b473"
                            h="60px"
                            fontSize={"lg"}
                            borderRadius={"12px"}
                            onClick={() => navigate("/home")
                            }
                        >
                            Open Wallet
                        </Button>
                    </Box>

                </Box>
            )
            }

            {
                stepIndex !== 2 && (
                    <Box
                        w="100%"
                        px="4"
                        pb={8}
                        borderRadius={"12px"}
                        border={"0.1px solid rgba(50, 143, 93, 0.3)"}
                    >

                        <HStack w="350px"
                            top={0}
                            position={"fixed"}
                            mt={12}
                            alignItems={"center"}
                            // p={2}
                            justifyContent={"center"}>
                            {steps.map((x, i) => (
                                <Box
                                    bg={i === stepIndex ? "#66b473" : "gray"}
                                    key={i}
                                    rounded={"full"} h="12px" w="12px" />
                            ))}
                        </HStack>

                        <Center
                            pt={18}
                        >
                            <VStack
                                w="100%"
                                h="100%"
                                justifyContent={"center"}
                                alignContent={"space-between"}
                            >
                                {stepIndex === 0 && (
                                    <Box w="100%">
                                        <Heading fontSize={"24px"} textAlign={"center"}>Import Wallet</Heading>


                                        {/* if no exisitng password, else just confirm password */}
                                        <InputGroup>
                                            <Input
                                                mt={4}
                                                placeholder="Enter password"
                                                type={showPassword ? "text" : "password"}
                                                h="60px"
                                                borderRadius={"12px"}
                                            />
                                            <InputRightElement mt={4} h="60px">
                                                <Box
                                                    as="button" onClick={togglePassword}>
                                                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                                                </Box>
                                            </InputRightElement>
                                        </InputGroup>

                                        <Input
                                            mt={4}
                                            placeholder="Repeat password"
                                            type={showPassword ? "text" : "password"}
                                            h="60px"
                                            borderRadius={"12px"}
                                        />
                                    </Box>

                                )}

                                {stepIndex === 1 && (
                                    <Box mt={12} w="100%">
                                        <Heading fontSize={"24px"} textAlign={"center"}>Seed Phrase</Heading>
                                        <Text pb={3} textAlign={'center'} fontSize={"xs"}>
                                            Paste your Seed Phrases below
                                        </Text>

                                        <Textarea
                                            onChange={(e) => setPhrase(e.target.value)}
                                        >
                                        </Textarea>
                                    </Box>

                                )}

                                <Box w="100%">
                                    <Button
                                        w="100%"
                                        bg="#66b473"
                                        mt={4}
                                        h="60px"
                                        fontSize={"lg"}
                                        borderRadius={"12px"}
                                        onClick={handleCreate}
                                    >
                                        {
                                            stepIndex == 1 ? "Recover Wallet" : "Create"
                                        }
                                    </Button>

                                </Box>
                            </VStack>
                        </Center>
                    </Box>
                )
            }


        </Box >

    );
};

export default ImportAccount;
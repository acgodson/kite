

import AnimatedSpinner from "../components/AnimatedSpinner";
import { Box, Text, Grid, Image, VStack, Center, Card, Button, HStack, Heading, Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import logo from "../assets/logo.webp"
import cover from "../assets/cover.png"
import { BiError } from 'react-icons/bi';
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { ethers } from "ethers";
import { shortenAddress } from "../utils/helpers";



const steps = [0, 1, 2];

const CreateAccount = ({ setWallet, setSeedPhrase }: any) => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [newSeedPhrase, setNewSeedPhrase] = useState<any>();
    const [newWallet, setNewWallet] = useState("");


    function generateWallet() {
        const mnemonic = ethers.Wallet.createRandom().mnemonic?.phrase;
        console.log(mnemonic)
        setNewSeedPhrase(mnemonic);
        setSeedPhrase(mnemonic);
        const wallet = ethers.Wallet.fromPhrase(mnemonic!)?.address;
        setNewWallet(wallet)
        setWallet(wallet);

    }

    // function set


    const togglePassword = () => {
        setShowPassword(!showPassword);
    }

    const handleCreate = () => {
        //TODO: confirm or store password


        //create nnemonic
        if (stepIndex === 0) {
            generateWallet();
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
                <Box h="100%" pb={24} display={"flex"} flexDir={"column"} justifyContent={"space-between"}>
                    <Box mt={8}>

                        <HStack spacing={3}
                            justifyContent={"center"}
                            alignItems={"center"}
                            pb={3}
                            opacity={"0.8"}
                            color="#66b473"
                        >
                            <Box><FaCheckCircle size="24px" /></Box>
                            <Box><Heading fontSize={"24px"}>New Wallet Address</Heading></Box>
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
                            bg="#66b473"
                            mt={4}
                            color="#1d2b32"
                            h="60px"
                            fontSize={"lg"}
                            borderRadius={"12px"}
                            onClick={handleCreate}
                        >
                            Better Way to Save & Invest
                        </Button>

                        <Button
                            w="100%"
                            mt={4}
                            h="60px"
                            fontSize={"lg"}
                            borderRadius={"12px"}
                            onClick={() => navigate("/home")
                            }
                        >
                            Skip for Now
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
                                        <Heading fontSize={"24px"} textAlign={"center"}>Create new Wallet</Heading>

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
                                        <Heading fontSize={"24px"} textAlign={"center"}>Recovery Seed Phrase</Heading>
                                        <HStack
                                            mt={1}
                                            opacity={"0.7"}
                                            bg="rgba(50, 143, 93, 0.1)"
                                            px={3}
                                            border={"solid 0.3px rgba(50, 143, 93, 0.3)"}
                                        >
                                            <BiError fontSize={48} color="red" />
                                            <Text fontSize={"xs"}>Make sure to write down this words in a secure place. You would lose access
                                                to your wallet if misplaced.
                                            </Text>
                                        </HStack>
                                        <Card mt={3} display={"flex"} alignItems={"center"} justifyContent={"center"} h="200px">
                                            <Center h="100%">
                                                {/* {newSeedPhrase} */}
                                                <Grid placeItems={"center"} placeContent={"center"} templateColumns="repeat(3, 1fr)" gap={4}>
                                                    {newSeedPhrase && newSeedPhrase.split(" ").map((word: string, index: number) => (
                                                        <Box key={index} textAlign="left">
                                                            {index + 1}. {word}
                                                        </Box>
                                                    ))}
                                                </Grid>
                                            </Center>
                                        </Card>

                                        <Button
                                            w="100%"
                                            mt={4}
                                            borderRadius={"12px"}
                                        >Copy </Button>
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
                                            stepIndex == 1 ? "Open Wallet" : "Create"
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

export default CreateAccount;
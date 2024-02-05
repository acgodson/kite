

import AnimatedSpinner from "../components/AnimatedSpinner";
import { Box, Text, Grid, Image, VStack, Center, Card, Button, HStack, Heading, Input, InputGroup, InputRightElement, Flex, useClipboard, Tooltip } from "@chakra-ui/react";
import logo from "../assets/logo.webp"
import cover from "../assets/cover.png"
import { BiError } from 'react-icons/bi';
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaCopy, FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { Wallet, ethers } from "ethers";
import { shortenAddress } from "../utils/helpers";
import { useAppContext } from "../contexts/appContext";
import PasswordValidator from "../components/Settings/PasswordValidator";
import { decryptPrivateKey, encryptPrivateKey } from "../components/Settings/crypto";
import { CreatingWalletLoader } from "../components/Settings/CreatingWalletLoader";
import { storage } from "../utils/storage";

declare var chrome: any;

const steps = [0, 1, 2];

const CreateAccount = () => {
    const { showSplashScreen,
        password,
        setPassword,
        accounts,
        setAccounts,
        activeAccount,
        setActiveAccount, } = useAppContext();
    const navigate = useNavigate();
    const [repeatPassword, setRepeatPassword] = useState("gamer");
    const [showPassword, setShowPassword] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [backup, setBackup] = useState<any | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const { onCopy } = useClipboard(backup)
    // const [isLoading, setIsLoading] = useState(true)

    const handleCopy = () => {
        onCopy();
        setShowTooltip(true);
        setTimeout(() => {
            setShowTooltip(false);
        }, 2000); // Hide the tooltip after 2 seconds
    };



    function verifyPassword() {
        if (password !== repeatPassword) {
            return;
        }
        generateWallet();
    }


    async function generateWallet() {
        const mnemonic = ethers.Wallet.createRandom().mnemonic?.phrase;
        setBackup(mnemonic);
        const address = Wallet.fromPhrase(mnemonic!).address;
        const privateKey = Wallet.fromPhrase(mnemonic!).privateKey;
        const encryptedPrivateKey = encryptPrivateKey(privateKey, password)
        //new account
        const account = {
            address,
            privateKey: await encryptedPrivateKey,
        }

        console.log(" private key", privateKey)
        //update accounts state
        setAccounts([account])
        //decrypt private Key
        const pKey = await decryptPrivateKey(await encryptedPrivateKey, password)!
        console.log("decrypted private key", pKey)
        if (!pKey) {
            //handle error
            console.error("failed to retrieve privateKey, incorrect password");
        }

        const accountsObject = { accounts: [account] };

        storage.local.set(accountsObject, function () {
            console.log('Accounts saved:', accountsObject);
        });

        //set Active Account
        setActiveAccount({
            address: address,
            privateKey: pKey!,
        }
        )
    }


    const togglePassword = () => {
        setShowPassword(!showPassword);
    }

    const handleCreate = () => {
        //create nnemonic
        if (stepIndex === 0) {
            verifyPassword();
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
                <>
                    <CreatingWalletLoader />
                </>
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
                                        <PasswordValidator password={password} repeatPassword={repeatPassword}>
                                            <InputGroup>
                                                <Input
                                                    mt={4}
                                                    placeholder="Enter password"
                                                    type={showPassword ? "text" : "password"}
                                                    h="60px"
                                                    borderRadius={"12px"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
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
                                                borderRadius={"12px"} value={repeatPassword}
                                                onChange={(e) => setRepeatPassword(e.target.value)}
                                            />
                                        </PasswordValidator>
                                    </Box>

                                )}

                                {stepIndex === 1 && (
                                    <Box mt={12} w="100%">
                                        <Heading fontSize={"24px"} textAlign={"center"}>Backup  Phrase</Heading>
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
                                                <Grid w="100%" placeItems={"center"} placeContent={"center"} templateColumns="repeat(3, 1fr)" gap={4}>
                                                    {backup && backup.split(" ").map((word: string, index: number) => (
                                                        <Flex borderRadius={"5px"} py={1} w="70px" bg="rgba(241 ,247, 244, 0.3)" key={index} textAlign="left">
                                                            <Text fontSize={"xs"} pr={2}>   {index + 1}.</Text>
                                                            <Text fontWeight={"semibold"} fontSize={"sm"}>{word}</Text>
                                                        </Flex>
                                                    ))}
                                                </Grid>
                                            </Center>
                                        </Card>
                                        <Box>
                                            <Button
                                                color="gray"
                                                w="100%"
                                                mt={4}
                                                onClick={handleCopy}
                                                borderRadius={"12px"}
                                                rightIcon={<FaCopy />}
                                            >Copy </Button>

                                            {showTooltip && <Tooltip label="Copied"
                                                isOpen={showTooltip} placement="top"><Box /></Tooltip>}
                                        </Box>
                                    </Box>
                                )}

                                <Box w="100%">
                                    <Button
                                        w="100%"
                                        bg="#66b473"
                                        color="white"
                                        _hover={{
                                            bg: "#66b473",
                                            color: "white"
                                        }}
                                        mt={6}
                                        h="55px"
                                        fontSize={"lg"}
                                        borderRadius={"12px"}
                                        isDisabled={stepIndex === 0 && password.length < 1 || repeatPassword.length < 1 ? true :
                                            false
                                        }
                                        onClick={handleCreate}
                                    >
                                        {
                                            stepIndex == 1 ? "I have Stored my seed phrase" : "Create"
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
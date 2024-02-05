

import AnimatedSpinner from "../components/AnimatedSpinner";
import { Box, Text, Grid, Image, Textarea, VStack, Center, Card, Button, HStack, Heading, Input, InputGroup, InputRightElement, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaCopy, FaExternalLinkAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Wallet, ethers } from "ethers";
import { shortenAddress } from "../utils/helpers";
import { useAppContext } from "../contexts/appContext";
import { encryptPrivateKey, decryptPrivateKey } from "../components/Settings/crypto";
import { storage } from "../utils/storage";
import { motion } from "framer-motion";
import beep from "../assets/beep.gif";
import PasswordValidator from "../components/Settings/PasswordValidator";
import { BiCopy } from "react-icons/bi";


const steps = [0, 1, 2];

const ImportAccount = () => {
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
    const [currentStep, setCurrentStep] = useState(1);
    const [stepIndex, setStepIndex] = useState(0);
    const [confirm, setConfirm] = useState(false);
    const [phrase, setPhrase] = useState<any>("pistol leisure swear hair bracket scrub install edge staff cement rival east");
    // const [phrase, setPhrase] = useState<any>("canvas wash trdansfer pair tray into alcohol harsh simple plunge absorb win");
    // const [phrase, setPhrase] = useState<any>("shallow thank emerge grape dinosaur deer yard marble brain sail between barrel");
    const [newWallet, setNewWallet] = useState("");


    const togglePassword = () => {
        setShowPassword(!showPassword);
    }


    useEffect(() => {
        // Check for existing accounts in storage
        storage.local.get('accounts', (result: any) => {
            const storedAccounts = result.accounts || [];
            setAccounts(storedAccounts);
            if (storedAccounts.length > 0) {
                setConfirm(true);
            }
        });
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prevStep => {
                if (prevStep < 2) {
                    return prevStep + 1;
                } else {
                    clearInterval(interval);
                    return prevStep;
                }
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const stepText = () => {
        switch (currentStep) {
            case 1:
                return "Finishing Up...";
            case 2:
                return (
                    <>
                        Your Wallet is <span style={{ color: "#b0ab00", fontWeight: "bold", textDecoration: "underline" }}>Ready!</span>
                    </>
                );
            default:
                return "";
        }
    };



    function verifyPassword() {
        if (password !== repeatPassword) {
            return;
        }
        if (confirm) {
            try {
                storage.local.get('accounts', async (result: any) => {
                    const storedAccounts = result.accounts || [];
                    setAccounts(storedAccounts);
                    let _accounts = storedAccounts[0];
                    const pKey = await decryptPrivateKey(_accounts.privateKey, password);
                    if (!pKey) {
                        console.error("password error")
                        return;
                    } else {
                        setStepIndex(stepIndex + 1);
                    }
                });
            } catch (e: any) {
                console.error("password error")
                return;
            }
        } else {
            setStepIndex(stepIndex + 1);
        }

    }

    async function recoverWallet() {

        if (!phrase || phrase.length < 5) {
            return
        }

        try {
            const wallet = ethers.Wallet.fromPhrase(phrase);

            if (!wallet) {
                console.log("no wallet")
                return;
            }

            const address = Wallet.fromPhrase(phrase!).address;
            const privateKey = Wallet.fromPhrase(phrase!).privateKey;
            const encryptedPrivateKey = encryptPrivateKey(privateKey, password)

            //new account
            const _account = {
                address,
                privateKey: await encryptedPrivateKey,
            }

            //update accounts state
            setAccounts(prevAccounts => {
                const updatedAccounts = [...prevAccounts, _account];
                return updatedAccounts;
            });

            //update accounts storage
            storage.local.get('accounts', (result: any) => {
                const storedAccounts = result.accounts || [];
                const updatedAccounts = [...storedAccounts, _account];
                const accountsObject = { accounts: updatedAccounts };
                storage.local.set(accountsObject, () => {
                    console.log('Accounts updated:', accountsObject);

                });
            });

            setActiveAccount({
                address: address,
                privateKey: privateKey!,
            }
            )

            setStepIndex(stepIndex + 1);
        } catch (e) {
            console.log("error with phrase", e)
        }

    }



    const handleCreate = () => {
        //create nnemonic
        if (stepIndex === 0) {

            verifyPassword();
        }

        if (stepIndex === 1) {
            recoverWallet();
        }

        if (stepIndex > 1) {
            setStepIndex(stepIndex + 1);
            return
        }
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

                    <>
                        <Box mt={0} w="100%">

                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.6 }}
                            >
                                <HStack
                                    mt={1}
                                    opacity={"0.7"}
                                    px={3}
                                    py={1}
                                    color="green"
                                    justifyContent={"center"}
                                >
                                    {currentStep === 2 && <Box><FaCheckCircle size="18px" /></Box>}
                                    <Box> <Text fontWeight={"semibold"} fontSize={"18px"}>{stepText()}</Text></Box>
                                </HStack>
                            </motion.div>

                            <Card mt={3} display={"flex"} alignItems={"center"} justifyContent={"center"} h="200px">
                                <Center h="100%">
                                    {currentStep === 2 ?
                                        <Box
                                            w="100%"
                                            px={1}
                                            pb={8}
                                            borderRadius={"12px"}
                                        >
                                            {
                                                activeAccount?.address && (
                                                    <Box w="100%">
                                                        <Button
                                                            w="100%"
                                                            bg={"rgba(50, 143, 93, 0.1)"}
                                                            mt={4}
                                                            h="60px"
                                                            fontSize={"xs"}
                                                            color={"#3182ce"}
                                                            textDecoration={"underline"}
                                                        >
                                                            {activeAccount.address} <BiCopy />

                                                        </Button>
                                                    </Box>
                                                )
                                            }
                                        </Box>
                                        : <Image
                                            src={beep}
                                            alt="beeep"
                                            opacity={0.2}
                                        />
                                    }


                                </Center>
                            </Card>

                        </Box>
                        <Box w="100%">
                            {currentStep === 2 && (
                                <motion.div
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Button
                                        w="100%"
                                        bg="#66b473"
                                        mt={4}
                                        color="white"
                                        h="55px"
                                        _hover={{
                                            bg: "66b473",
                                            color: "white"
                                        }}
                                        _active={{
                                            bg: "66b473",
                                            color: "white"
                                        }}
                                        _focus={{
                                            bg: "66b473",
                                            color: "white"
                                        }}
                                        fontSize={"lg"}
                                        borderRadius={"12px"}
                                        onClick={() => navigate("/home")}
                                    >
                                        {confirm ? "Continue" : "Open"}
                                    </Button>
                                </motion.div>
                            )}
                        </Box>
                    </>
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
                                        <Heading fontSize={"24px"} textAlign={"center"}>
                                            {confirm ? "Confirm" : "Set"}  Password</Heading>
                                        <PasswordValidator password={password} repeatPassword={repeatPassword}>
                                            {/* if no exisitng password, else just confirm password */}
                                            <InputGroup>
                                                <Input
                                                    mt={4}
                                                    placeholder="Enter password"
                                                    type={showPassword ? "text" : "password"}
                                                    h="60px"
                                                    borderRadius={"12px"}
                                                    value={password}
                                                    onChange={(e) => {
                                                        if (confirm) {
                                                            setRepeatPassword(e.target.value)
                                                        }
                                                        setPassword(e.target.value);
                                                    }}
                                                />
                                                <InputRightElement mt={4} h="60px">
                                                    <Box
                                                        as="button" onClick={togglePassword}>
                                                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                                                    </Box>
                                                </InputRightElement>
                                            </InputGroup>

                                            {!confirm && (
                                                <Input
                                                    mt={4}
                                                    placeholder="Repeat password"
                                                    type={showPassword ? "text" : "password"}
                                                    h="60px"
                                                    borderRadius={"12px"} value={repeatPassword}
                                                    onChange={(e) => {

                                                        setRepeatPassword(e.target.value);
                                                    }}
                                                />
                                            )}
                                        </PasswordValidator>
                                    </Box>

                                )}

                                {stepIndex === 1 && (
                                    <Box mt={12} w="100%">
                                        <Heading fontSize={"24px"} textAlign={"center"}>Seed Phrase</Heading>
                                        <Text pb={3} textAlign={'center'} fontSize={"xs"} color={"#66b473"}>
                                            Paste your Seed Phrases below
                                        </Text>

                                        <Textarea
                                            value={phrase}
                                            onChange={(e) => setPhrase(e.target.value)}
                                        >
                                        </Textarea>
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
                                        isDisabled={
                                            stepIndex === 0 && password.length < 1 || repeatPassword.length < 1 ? true :
                                                stepIndex === 1 && !phrase || stepIndex === 1 && phrase.length < 5 ? true : false
                                        }
                                        onClick={handleCreate}
                                    >
                                        {
                                            stepIndex == 1 ? "Recover Wallet" : "Continue"
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
import { HStack, Card, Center, Image, Button, Box, Text } from "@chakra-ui/react";
import { FaCheckCircle, } from "react-icons/fa";
import { BiCopy } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../contexts/appContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import beep from "../../assets/beep.gif";




export function CreatingWalletLoader() {
    const [currentStep, setCurrentStep] = useState(1);
    const navigate = useNavigate();
    const { showSplashScreen,
        password,
        setPassword,
        accounts,
        setAccounts,
        activeAccount } = useAppContext();;
    const [showBorder, setShowBorder] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prevStep => {
                if (prevStep < 3) {
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
                return "Creating Wallet";
            case 2:
                return "Finishing Up...";
            case 3:
                return (
                    <>
                        Your Wallet is <span style={{ color: "#b0ab00", fontWeight: "bold", textDecoration: "underline" }}>Ready!</span>
                    </>
                );
            default:
                return "";
        }
    };


    return (
        <>

            <>
                <Box mt={0} w="100%">

                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        onAnimationComplete={() => {
                            setShowBorder(true);
                        }}
                    >
                        <HStack
                            mt={1}
                            opacity={"0.7"}
                            px={3}
                            py={1}
                            color="green"
                            justifyContent={"center"}
                        >
                            {currentStep === 3 && <Box><FaCheckCircle size="18px" /></Box>}
                            <Box> <Text fontWeight={"semibold"} fontSize={"18px"}>{stepText()}</Text></Box>
                        </HStack>
                    </motion.div>

                    <Card mt={3} display={"flex"} alignItems={"center"} justifyContent={"center"} h="200px">
                        <Center h="100%">
                            {currentStep === 3 ?
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
                    {currentStep === 3 && (
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
                                Open
                            </Button>
                        </motion.div>
                    )}
                </Box>
            </>



        </>
    )

}
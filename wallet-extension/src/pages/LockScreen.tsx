import * as React from "react"
import {
    Box,
    Text,
    VStack,
    Heading,
    Card,
    Input,
    Button,
    InputGroup,
    InputRightElement,
} from "@chakra-ui/react";
import { FaEye, FaEyeSlash, FaLockOpen } from "react-icons/fa";
import { useState } from "react";
import NavBar from "../components/Nav/NavBar";
import { Logo } from "../components/SplashScreen/Logo";
import { storage } from "../utils/storage";
import { useAppContext } from "../contexts/appContext";
import { decryptPrivateKey } from "../components/Settings/crypto";
import { useNavigate } from "react-router-dom";




const LockScreen = () => {
    const { activeAccount, setActiveAccount, setAccounts } = useAppContext();
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate();

    const togglePassword = () => {
        setShowPassword(!showPassword);
    }

    const unlock = async () => {
        //we'll try to use he password to decrypt the stored Accounts private Key
        setError(null);
        try {
            storage.local.get('accounts', async (result: any) => {
                const storedAccounts = result.accounts || [];
                setAccounts(storedAccounts);
                let _accounts = [];

                for (let i = 0; i < 1; i++) {
                    const account = storedAccounts[i];

                    const pKey = await decryptPrivateKey("uzPGmYq5GvRRVhIPEFbyqQN9k71Okrs/w3am9q8THssAISF+Ljc1q54MGzxek9Z1vZRdc1rHvFGNT8aAjamFGLWFXF8D8GOcWR/2gK4RbrCaVWiVuWIXtpNZSW0P+6N1LiUJAfkuYsiSrt4rQiY=", "gamer");
                    if (pKey) {
                        console.log(pKey);
                        const obj = {
                            address: account.address,
                            privateKey: pKey
                        }
                        _accounts.push(obj);
                    } else {
                        setError("incorrect password");
                        return;
                    }
                }
                console.log("here's the private key mate", _accounts)
                // setAccounts(_accounts);
                // setActiveAccount(_accounts[0])
                // navigate("/home")

            });
        } catch (e: any) {
            setError(e);
        }
    }

    return (
        <Box
            bg="blackAlpha.50"
            w="100%" h="600px">
            <NavBar />
            <Logo h="50px" pointerEvents="none" />
            <VStack h="400px"
                pt={16}
                alignItems={"space-between"}
                justifyContent={"space-between"}

            >
                <VStack
                    align={"center"}
                    justifyContent={"center"}
                    spacing={5}
                >
                    {/* <Heading pb={8} fontSize={"2xl"}>Welcome Back!</Heading> */}
                    {/* Change later */}



                </VStack>

                <VStack>
                    <Card
                        position={"absolute"}
                        bottom={0}
                        w="100%"
                        h="43%"
                        p={6}
                        borderTopRadius={"25px"}
                        boxShadow={"0px -4px 10px rgba(0, 0, 0, 0.1)"}
                    >
                        <Text fontWeight={"semibold"}>Password</Text>
                        <InputGroup>
                            <Input
                                mt={4}
                                type={showPassword ? "text" : "password"}
                                h="60px"
                                value={password}
                                onChange={(e) => {
                                    setError(null)
                                    setPassword(e.target.value)
                                }}
                                borderRadius={"12px"}
                            />
                            <InputRightElement mt={4} h="60px">
                                <Box as="button" onClick={togglePassword}>
                                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                                </Box>
                            </InputRightElement>
                        </InputGroup>

                        <Button
                            mt={4}
                            h="70px"
                            borderRadius={"12px"}
                            leftIcon={<FaLockOpen />}
                            isDisabled={password.length < 1}
                            onClick={unlock}
                        > Unlock</Button>
                    </Card>
                </VStack>


            </VStack>
        </Box>
    )

}

export default LockScreen;
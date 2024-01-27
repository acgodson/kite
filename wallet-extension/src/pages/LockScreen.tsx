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




const LockScreen = () => {
    const [showPassword, setShowPassword] = useState(false)

    const togglePassword = () => {
        setShowPassword(!showPassword);
    }

    return (
        <Box
            bg="blackAlpha.50"
            w="100%" h="600px">
            <NavBar />

            <VStack h="100%" pt={16} justifyContent={"space-between"}>
                <VStack align={"center"}>
                    <Heading pb={8} fontSize={"2xl"}>Welcome Back!</Heading>
                  {/* Change later */}
                    <Logo h="100px" pointerEvents="none" />
                </VStack>

                <Card
                    w="100%"
                    h="40%"
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
                    > Unlock</Button>
                </Card>
            </VStack>
        </Box>
    )

}

export default LockScreen;
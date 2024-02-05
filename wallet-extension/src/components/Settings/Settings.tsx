import { Button, Box, Text, FormLabel, Input, VStack, HStack, useColorMode, Avatar, InputGroup, InputRightElement, } from "@chakra-ui/react";
import React, { useState } from "react";
import { shortenAddress } from "../../utils/helpers";
import { ColorModeSwitcher } from "../Nav/ColorModeSwitcher";
import { BiArrowBack, BiTrash } from "react-icons/bi";
import { FaChevronRight, FaExternalLinkAlt, FaEye, FaEyeSlash, FaKey, FaLink } from "react-icons/fa";
import { useAppContext } from "../../contexts/appContext";




const SettingsView = () => {
    const { accounts, activeAccount, setActiveAccount, } = useAppContext();
    const [view, setView] = useState("main");
    const { colorMode } = useColorMode();
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const address = activeAccount?.address!;

    const togglePassword = () => {
        setShowPassword(!showPassword);
    }
    const confirmPassword = () => {
        // if (!error) {
        //     return;
        // }
        setShowPassword(false);
        setPassword("");
        setView("resetPassword");

    }
    const resetPassword = () => {
        setView("main")
        setShowPassword(false);
        setPassword("");
    }

    switch (view) {
        case "main":
            return (
                <VStack pt={4} w="100%" alignItems={"flex-start"}>
                    <Text fontWeight={"bold"}>Settings</Text>
                    <Box
                        mt={2}
                        as="button"
                        h="65px"
                        w="100%"
                        // bg="transparent"
                        borderRadius={"12px"}
                        border="1px solid rgba(50, 143, 93, 0.3)"
                        bg="rgba(50, 143, 93, 0.1)"
                        onClick={() => setView("connectedAccount")}
                        px={4}
                    >
                        <HStack spacing={3}>
                            <Box
                                bg='black'
                                h="30px"
                                w='30px'
                                rounded={"full"}
                            />
                            <Box>
                                <Text fontWeight={"bold"} fontSize={"sm"} textAlign={"left"}> Account {accounts.findIndex((x) => x.address === activeAccount?.address) + 1}</Text>

                                <Text>{shortenAddress(address)}</Text>

                            </Box>
                        </HStack>
                    </Box>
                    <Box
                        mt={2}
                        h="65px"
                        w="100%"
                        bg="transparent"
                        borderRadius={"12px"}
                        border="1px solid rgba(50, 143, 93, 0.3)"
                        // bg="rgba(50, 143, 93, 0.1)"
                        // onClick={() => setView("connectedAccount")}
                        px={4}
                    >
                        <HStack h="100%" spacing={3} alignItems="center" justifyContent={"space-between"}>

                            <Box>
                                <Text fontWeight={"semibold"}>
                                    Switch to {colorMode === "light" ? "dark" : "light"} mode
                                </Text>
                            </Box>
                            {/* <Button> */}
                            <ColorModeSwitcher justifySelf="flex-end" />
                            {/* </Button> */}
                        </HStack>
                    </Box>

                    <Box
                        mt={2}
                        h="65px"
                        w="100%"
                        px={4}
                        bg="transparent"
                        borderRadius={"12px"}
                        border="1px solid rgba(50, 143, 93, 0.3)"
                        as='button'
                        onClick={() => setView("changePassword")}>

                        <Text fontWeight={"semibold"} textAlign={"left"}>Change Password</Text>
                    </Box>
                </VStack>
            );
        case "connectedAccount":
            return (
                <VStack
                    h="400px"
                    justifyContent={"space-between"}
                    alignItems={"space-between"} w="100%" pt={4}>
                    <Box>
                        <Button onClick={() => setView("main")}>
                            <BiArrowBack />
                        </Button>

                        <Box
                            mt={8}
                            h="65px"
                            w="100%"
                            bg="transparent"
                            borderRadius={"12px"}
                            border="1px solid rgba(50, 143, 93, 0.3)"
                            px={4}
                        >
                            <HStack h="100%" spacing={3} alignItems="center" justifyContent={"space-between"}>

                                <Avatar
                                    size="sm"
                                    icon={<FaLink />}
                                />

                                <Box>
                                    <Text fontWeight={"semibold"}>
                                        View on Explorer
                                    </Text>
                                </Box>
                                <Box>
                                    <HStack opacity={"0.9"} spacing={3}>
                                        {shortenAddress(address)}
                                        <FaExternalLinkAlt />
                                    </HStack>
                                </Box>
                            </HStack>
                        </Box>

                        <Box
                            mt={4}
                            h="65px"
                            w="100%"
                            bg="transparent"
                            borderRadius={"12px"}
                            border="1px solid rgba(50, 143, 93, 0.3)"
                            px={4}
                        >
                            <HStack h="100%" spacing={3} alignItems="center" justifyContent={"space-between"}>

                                <Avatar
                                    size="sm"
                                    icon={<FaKey />}
                                />

                                <Box>
                                    <Text fontWeight={"semibold"}>
                                        Reveal private key
                                    </Text>
                                </Box>
                                <Box>
                                    <HStack opacity={"0.9"} spacing={3}>
                                        <FaChevronRight />
                                    </HStack>
                                </Box>
                            </HStack>
                        </Box>
                    </Box>

                    <Box>
                        <Box
                            mt={4}
                            h="65px"
                            w="100%"
                            bg="transparent"
                            borderRadius={"12px"}
                            border="0.5px solid red"
                            px={4}
                            as="button"
                        >
                            <HStack h="100%" spacing={3} alignItems="center" justifyContent={"center"}>
                                <BiTrash
                                    fontSize="md"
                                    color="red"
                                />
                                <Box>
                                    <Text
                                        color="red"
                                        fontWeight={"light"}>
                                        Remove Account
                                    </Text>
                                </Box>
                            </HStack>
                        </Box>
                    </Box>
                </VStack>
            );
        case "changePassword":
            return (
                <Box pt={4} h='300px'>
                    <HStack alignItems={"center"}>
                        <Button onClick={() => setView("main")}>
                            <BiArrowBack />
                        </Button>
                        <Text fontWeight={"bold"}>Change Password</Text>
                    </HStack>

                    <VStack w='100%' justifyContent={"space-between"} alignItems={"space-between"} pt={4} h="100%">
                        <Box>
                            <FormLabel>Current Password</FormLabel>
                            <InputGroup>
                                <Input
                                    mt={4}
                                    type={showPassword ? "text" : "password"}
                                    h="60px"
                                    value={password}
                                    borderRadius={"12px"}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <InputRightElement mt={4} h="60px">
                                    <Box as="button" onClick={togglePassword}>
                                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                                    </Box>
                                </InputRightElement>

                            </InputGroup>
                        </Box>

                        <Box>
                            <Button
                                colorScheme="green"
                                w="100%"
                                h="50px"
                                onClick={confirmPassword}
                            >Confirm</Button>
                        </Box>
                    </VStack>
                    {/* Add logic to show password change form */}
                </Box>
            );
        case "resetPassword":
            return (
                <Box pt={4} h='300px'>
                    <HStack alignItems={"center"}>
                        <Button onClick={() => setView("main")}>
                            <BiArrowBack />
                        </Button>
                        <Text fontWeight={"bold"}> Password Reset</Text>
                    </HStack>

                    <VStack w='100%' justifyContent={"space-between"} alignItems={"space-between"} pt={4} h="100%">
                        <Box>
                            <FormLabel>New Password</FormLabel>
                            <InputGroup>
                                <Input
                                    mt={4}
                                    type={showPassword ? "text" : "password"}
                                    h="60px"
                                    value={password}
                                    borderRadius={"12px"}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <InputRightElement mt={4} h="60px">
                                    <Box as="button" onClick={togglePassword}>
                                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                                    </Box>
                                </InputRightElement>

                            </InputGroup>
                            <FormLabel>Repeat Password</FormLabel>
                            <Input
                                mt={4}
                                type={showPassword ? "text" : "password"}
                                h="60px"
                                value={repeatPassword}
                                onChange={(e) => setRepeatPassword(e.target.value)}
                                borderRadius={"12px"}
                            />
                        </Box>

                        <Box>
                            <Button
                                colorScheme="green"
                                w="100%"
                                h="50px"
                                onClick={resetPassword}
                            >Confirm</Button>
                        </Box>
                    </VStack>

                </Box>
            );
        default:
            return <Box> View Error</Box>;
    }
};

export default SettingsView;
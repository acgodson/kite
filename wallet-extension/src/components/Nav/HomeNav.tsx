

import { Box, Image, Text, Grid, VStack, useClipboard, Center, HStack, Button, Container, Flex, Avatar, Card, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, useDisclosure, Slide, Heading, useColorMode, useToast, Tooltip } from "@chakra-ui/react";
import logo from "../../assets/logo.webp"
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { BiCheck, BiCopy, BiScan } from "react-icons/bi";
import { useState } from "react";
import QRCode from "react-qr-code";
import { shortenAddress } from "../../utils/helpers";





const HomeNav = ({ wallet }: { wallet: string }) => {
    const [address, setAddress] = useState("Ox12...905j"); // Replace with the actual address
    const { isOpen, onClose, onOpen } = useDisclosure()
    const [page, setPage] = useState<number | null>(null)
    const { colorMode } = useColorMode();
    const { value, setValue, onCopy } = useClipboard(wallet)
    const toast = useToast();
    const [showTooltip, setShowTooltip] = useState(false);



    const handleCopy = () => {
        onCopy();
        setShowTooltip(true);
        setTimeout(() => {
            setShowTooltip(false);
        }, 2000); // Hide the tooltip after 2 seconds
    };



    return (
        <Box zIndex={"tooltip"} position={"fixed"}>
            <Card
                top={0}
                pb={4}
                borderRadius={"none"}
                pt={1}
                boxShadow={"none"}
                borderBottom={"0.1px solid rgba(50, 143, 93, 0.3)"}
                w="400px"
                h="55px"
                textAlign="center"
                fontSize="xl">
                <HStack pt={1} px={4} justifyContent="space-between">
                    <Flex align={"center"}>
                        <Button
                            bg="rgba(50, 143, 93, 0.1)"
                            onClick={() => {
                                setPage(0)
                                onOpen();
                            }} fontWeight={"bold"}>   <BiScan /></Button>
                        <Button bg="rgba(50, 143, 93, 0.1)" onClick={handleCopy} ml={3}>{shortenAddress(wallet)}</Button>
                        {showTooltip && <Tooltip label="Copied"
                            isOpen={showTooltip} placement="top"><Box />
                        </Tooltip>
                        }
                    </Flex>

                    <Box as="button" onClick={() => {
                        setPage(1)
                        onOpen();
                    }} h="40px" w="40px" rounded={"full"} bg="#111e1d" />
                    {/* <Image src={logo} h="30px" pointerEvents="none" /> */}


                </HStack>


            </Card>



            <Slide direction="bottom" in={isOpen} >

                <Card
                    borderRadius={"none"}
                    boxShadow={"none"}
                    bottom={("calc(100vh - 600px)")}
                    marginTop={"-400px"}
                    zIndex={"tooltip"}
                    transition={isOpen ? "ease-in 0.3s" : "none"}
                    h={isOpen ? "600px" : "0px"}
                    p={isOpen ? 4 : 0}
                    w="400px"
                    position="absolute"

                >
                    {isOpen && (
                        page === 0 ?
                            <>
                                <HStack justifyContent={"space-between"}>
                                    <Heading size={"md"}>My Address</Heading>
                                    <Button w="35px" h='35px' rounded={"full"} onClick={onClose}>
                                        <Text fontSize={"xl"}>x</Text>
                                    </Button>
                                </HStack>

                                <Button
                                    bg="rgba(50, 143, 93, 0.1)"
                                    h="50px"
                                    my={8}
                                    w="100%"
                                    boxShadow={"none"}>
                                    {address}
                                </Button>
                                <Center>
                                    <Box
                                        display={"flex"}
                                        justifyContent={"center"}
                                        alignItems={"center"}
                                        flexDirection={"column"}
                                        w="100%"
                                        h="400px"
                                        bg="rgba(50, 143, 93, 0.1)"
                                        p={8}>
                                        <Card
                                            borderRadius={"12px"}
                                            boxShadow={"none"}
                                            w={220} p={8}
                                            textAlign="center" mt={4}>
                                            <QRCode
                                                fgColor={colorMode === "light" ? "black" : "white"}
                                                bgColor={colorMode === "light" ? "white" : "#2d3748"}
                                                value={address} size={160} />
                                        </Card>
                                    </Box>
                                </Center>
                            </> :
                            <>
                                <HStack justifyContent={"space-between"}>
                                    <Heading size={"md"}>Switch Accounts</Heading>
                                    <Button w="35px" h='35px' rounded={"full"} onClick={onClose}>
                                        <Text fontSize={"xl"}>x</Text>
                                    </Button>
                                </HStack>

                                <Box
                                    h="50px"
                                    my={8}
                                    w="100%"
                                    boxShadow={"none"}>
                                    <Flex p={3}
                                        borderRadius={"10px"}
                                        border={"0.3px solid"}
                                        justify={"space-between"}>
                                        <HStack spacing={3}>
                                            <Box bg="black" h="40px" w="40px" rounded={"full"} />
                                            <Box fontSize={"sm"}>
                                                <Text fontWeight={"semibold"}> Account 1</Text>
                                                <Text>{shortenAddress(wallet)}</Text>
                                            </Box>
                                        </HStack>
                                        <Box as="button">
                                            <BiCopy size={24} opacity={0.3}
                                                fontWeight={"semibold"} />
                                        </Box>
                                    </Flex>
                                </Box>



                            </>
                    )}
                </Card>
            </Slide>


        </Box>

    );
};

export default HomeNav;
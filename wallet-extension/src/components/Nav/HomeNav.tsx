

import { useState } from "react";
import { Box, Text, VStack, useClipboard, Center, HStack, Button, Flex, Card, useDisclosure, Slide, Heading, useColorMode, Tooltip, List, ListItem } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { BiCopy, BiScan } from "react-icons/bi";
import QRCode from "react-qr-code";
import { FaLock, FaPlusCircle } from "react-icons/fa";
import { renderAvatar, shortenAddress } from "../../utils/helpers";
import { useAppContext } from "../../contexts/appContext";





const HomeNav = () => {

    const { accounts, activeAccount, setActiveAccount, setBalance, setTokens } = useAppContext();
    const { isOpen, onClose, onOpen } = useDisclosure()
    const [page, setPage] = useState<number | null>(null)
    const { colorMode } = useColorMode();
    const [showTooltip, setShowTooltip] = useState(false);
    const [showTooltip2, setShowTooltip2] = useState(false);
    const [accountIndex, setAccountIndex] = useState(0);
    const { onCopy, setValue } = useClipboard(accounts[accountIndex].address)

    const navigate = useNavigate();

    const handleAccountSelect = (account: any) => {
        setActiveAccount(account);
        setBalance(null);
        setTokens(null)
        onClose();
    };


    const handleCopy = (value: string) => {
        onCopy();
        setShowTooltip(true);
        setTimeout(() => {
            setShowTooltip(false);
        }, 2000);
    };


    const handleCopy2 = (value: string) => {
        // alert(value);
        onCopy();
        setShowTooltip2(true);
        setTimeout(() => {
            setShowTooltip2(false);
        }, 2000);
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
                        <Button bg="rgba(50, 143, 93, 0.1)" onClick={() => handleCopy(activeAccount?.address!)} ml={3}>{shortenAddress(activeAccount?.address || "")}</Button>
                        {showTooltip && <Tooltip label="Copied"
                            isOpen={showTooltip} placement="top"><Box />
                        </Tooltip>
                        }
                    </Flex>

                    <Box onClick={() => {
                        setPage(1)
                        onOpen();
                    }} h="40px" w="40px" rounded={"full"}
                        as="img"
                        src={renderAvatar(activeAccount?.address!)}
                    />
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
                                    fontSize={"xs"}
                                    boxShadow={"none"}>
                                    {activeAccount?.address || ""}
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
                                                value={activeAccount?.address || ""} size={160} />
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

                                <VStack
                                    w="100%"
                                    h="100%"
                                    alignItems={"space-between"}
                                    justifyContent={"space-between"}
                                >
                                    <List mt={8}>
                                        {accounts.map((account, index) => (
                                            <ListItem key={`${account.address}${index}`}
                                                pb={2}
                                                my={3}
                                                style={{
                                                    border: activeAccount?.address === account.address ? '2px solid #68d391' : '0.3px solid',
                                                    borderRadius: '10px',
                                                    boxShadow: 'none',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <Box h="50px" my={1} w="100%">
                                                    <Flex justify={"space-between"}>
                                                        <HStack
                                                            p={3}
                                                            spacing={3}
                                                            // bg="red"
                                                            w="100%"
                                                            // h="100%"
                                                            onClick={() => handleAccountSelect(account)}
                                                        >
                                                            <Box as="img" src={renderAvatar(account?.address!)} h="40px" w="40px" rounded={"full"} />
                                                            <Box fontSize={"sm"}>
                                                                <Text fontWeight={"semibold"}> Account {index + 1}</Text>
                                                                <Text>{shortenAddress(account?.address || "")}</Text>
                                                            </Box>
                                                        </HStack>

                                                        <Box as="button">
                                                            <Button bg="rgba(50, 143, 93, 0.1)" onClick={() => {
                                                                handleCopy2(account?.address!);
                                                                setAccountIndex(index)
                                                            }} ml={3}>
                                                                <BiCopy size={24} opacity={0.3} fontWeight={"semibold"} />
                                                            </Button>
                                                            {showTooltip2 && index === accountIndex && <Tooltip label="Copied"
                                                                isOpen={showTooltip2} placement="top"><Box />
                                                            </Tooltip>}

                                                        </Box>
                                                    </Flex>
                                                </Box>
                                            </ListItem>
                                        ))}

                                        <HStack py={8} alignItems={"center"} cursor={"pointer"} as="button" onClick={() => navigate("/import")}>
                                            <FaPlusCircle style={{ color: "#68d391" }} />
                                            <Text color="green.300" fontWeight={"bold"}>Import Accounts</Text>
                                        </HStack>
                                    </List>
                                    <Box>
                                        <Box
                                            mt={4}
                                            h="65px"
                                            w="100%"
                                            bg="transparent"
                                            borderRadius={"12px"}
                                            border="0.5px solid"
                                            px={4}
                                            as="button"
                                            // position={"absolute"}
                                            bottom={0}
                                            onClick={() => {
                                                navigate("/lock")
                                            }}
                                        >
                                            <HStack h="100%" spacing={3} alignItems="center" justifyContent={"center"}>
                                                <FaLock
                                                    fontSize="md"
                                                // color="red"
                                                />
                                                <Box>
                                                    <Text
                                                        // color="#333"
                                                        fontWeight={"semibold"}>
                                                        Lock
                                                    </Text>
                                                </Box>
                                            </HStack>
                                        </Box>
                                    </Box>

                                </VStack>

                            </>
                    )}
                </Card>
            </Slide>


        </Box>

    );
};

export default HomeNav;



import { useEffect, useState } from "react";
import { ChakraProvider, Text, Box, Tabs, TabList, Tab, TabPanels, TabPanel, Image, Grid, List, ListItem, Flex, HStack, Divider, Avatar } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useAppContext } from "../../contexts/appContext";
import { renderAvatar } from "../../utils/helpers";
import { Asset } from "../../utils/types";


// export const tokens = [
//     {
//         "token": {
//             "address": "0x3b70652cB79780cA1bf60a8b34cc589BbeDc00B2",
//             "circulating_market_cap": null,
//             "decimals": "18",
//             "exchange_rate": null,
//             "holders": "4",
//             "icon_url": null,
//             "name": "USDC",
//             "symbol": "USDC",
//             "total_supply": "100000000000000000000",
//             "type": "ERC-20"
//         },
//         "token_id": null,
//         "token_instance": null,
//         "value": "60000000000000000000"
//     },
// ]

const MyTokens = ({ tokens, setView, setSelectedToken }: { tokens: any, setView: any, setSelectedToken: any }) => {
    // const { showSplashScreen,
    //     password,
    //     setPassword,
    //     accounts,
    //     setAccounts,
    //     activeAccount,
    //     setActiveAccount, } = useAppContext();

    return (
        <ChakraProvider>
            <Tabs p={0} variant="line" colorScheme="green">
                <TabList>
                    <Tab>Tokens</Tab>
                    <Tab>NFTs</Tab>
                </TabList>
                <TabPanels w="100%">
                    <TabPanel w="100%">
                        <List
                            position={"absolute"}
                            w="365px"
                            pb={32}
                            m={0}
                            left={0}
                            px={2}
                            borderRadius={"10px"}
                        >
                            {tokens && tokens.map((token: Asset, index: number) => {
                                const roundedBalance = parseFloat(ethers.formatEther(token.value as any)).toFixed(Math.max(2, token.value?.toString().split(".")[1]?.length || 0))
                                const value = token.token.exchange_rate! * Number(roundedBalance);
                                const price = parseFloat(value.toFixed(2).toString());
                                return (

                                    <ListItem
                                        cursor={"pointer"}
                                        key={`${token.token.name}-${index}`}
                                        onClick={() => {
                                            setView("token");
                                            setSelectedToken(token.token.symbol);
                                        }}
                                    >
                                        <Box
                                            my={3}
                                            py={1}
                                            boxShadow={"none"}>
                                            <Flex
                                                py={3}
                                                px={1}
                                                align={"center"}
                                                justify={"space-between"}>
                                                <HStack spacing={3}>
                                                    <Box
                                                        as="img"
                                                        src={renderAvatar(token.token.address)}
                                                        bg="black" h="40px" w="40px" rounded={"full"} />
                                                    <Box fontSize={"sm"}>
                                                        <Text fontWeight={"semibold"}>{token.token.name}</Text>
                                                        <Text>{Number(token.value) / 10 ** Number(token.token.decimals)} {token.token.symbol}</Text>
                                                    </Box>
                                                </HStack>
                                                <Text>${price}</Text>
                                            </Flex>
                                            {index !== tokens.length - 1 && (
                                                <Divider
                                                    py={2}
                                                    color="rgba(50, 143, 93, 0.3)"
                                                />
                                            )}
                                        </Box>
                                    </ListItem>)
                            })}

                        </List>
                    </TabPanel>
                    <TabPanel>
                        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                            {[0, 1, 2].map((x, i) => (
                                <Box
                                    key={i}
                                    h="70px"
                                    w="70px"
                                    bg="whitesmoke"
                                    opacity={0.1}
                                />
                            ))}
                        </Grid>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </ChakraProvider>
    );
};

export default MyTokens;
import * as React from "react";
import { ChakraProvider, Text, Box, Tabs, TabList, Tab, TabPanels, TabPanel, Image, Grid, List, ListItem, Flex, HStack, Divider } from "@chakra-ui/react";
import { BiCopy } from "react-icons/bi";


export const tokens = [
    {
        symbol: "ETH",
        name: "Ethereum",
        balance: 100000000000000,
        address: "",
        decimals: 18,
        price: 0
    },
    {
        symbol: "USDC",
        name: "USDC",
        balance: 100e18,
        address: "",
        decimals: 18,
        price: 0
    },
    {
        symbol: "NGN",
        name: "Naira",
        balance: 100e18,
        address: "",
        decimals: 18,
        price: 0
    },

]

const MyTokens = () => {
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
                            // border={"0.1px solid rgba(50, 143, 93, 0.3)"}
                        >
                            {tokens && tokens.map((token, index) => (
                                <ListItem
                                    key={token.name}
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
                                                <Box bg="black" h="40px" w="40px" rounded={"full"} />
                                                <Box fontSize={"sm"}>
                                                    <Text fontWeight={"semibold"}>{token.name}</Text>
                                                    <Text>{Number(token.balance) / 10 ** Number(token.decimals)} {token.symbol}</Text>
                                                </Box>
                                            </HStack>
                                            <Text>$100</Text>
                                        </Flex>
                                        {index !== tokens.length - 1 && (
                                            <Divider
                                                py={2}
                                                color="rgba(50, 143, 93, 0.3)"
                                            />
                                        )}
                                    </Box>
                                </ListItem>
                            ))}

                        </List>



                    </TabPanel>
                    <TabPanel>
                        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                            {/* Mock NFTs with square images */}
                            <Box>
                                <Image boxSize="100px" src="nft1.jpg" alt="NFT 1" />
                            </Box>
                            <Box>
                                <Image boxSize="100px" src="nft2.jpg" alt="NFT 2" />
                            </Box>
                            <Box>
                                <Image boxSize="100px" src="nft3.jpg" alt="NFT 3" />
                            </Box>
                        </Grid>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </ChakraProvider>
    );
};

export default MyTokens;
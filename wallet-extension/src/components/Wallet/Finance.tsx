import { Button, Box, Text, List, Image, HStack, useColorMode, Center, Heading, IconButton, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Flex, Select, Card, ListItem, Divider, } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BiChevronLeft } from "react-icons/bi";
import { FaEllipsisV, FaExternalLinkAlt } from "react-icons/fa";
import { FiExternalLink, FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../contexts/appContext";
import { Wallet, ethers } from "ethers";
import { KiteContract, PegasusRPC, SafeLockContract } from "../../utils/consts";
import { shortenAddress } from "../../utils/helpers";
import KiteArtifact from "../../utils/Kite.json"
import safe from "../../assets/safe.png";
import target from "../../assets/target.png";
import flexi from "../../assets/flexi.png";
import vault from "../../assets/vault.png";
import gemini from "../../assets/gemini.png";


//WARNING: hardcoded  for Wallet test version
const finance = [

    {
        title: "Featured",
        items: [
            {
                img: safe,
                name: "Safe Lock",
                color: "",
                address: SafeLockContract,
                description: "A strict savings strategy that locks withdrawals until a specified time",
                url: ""
            },
            {
                img: target,
                name: "Target Savings",
                color: "",
                address: "",
                description: "Allows you to halt deposits when a specific savings target is achieved.",
                url: ""
            },
            {
                img: flexi,
                name: "Flexi",
                color: "",
                address: "",
                description: "Enjoy the freedom to make withdrawals at various intervals over a specified period",
                url: ""
            },
        ]
    },

    {
        title: "Save and Earn",
        items: [
            {
                img: vault,
                name: "Yield Vault",
                color: "",
                address: "",
                description: "Lock tokens in an ERC-4626 yield vault over a designated period, extending savings to",
                url: ""
            },
        ]
    },

    {
        title: "Tools and Analytics",
        items: [
            {
                img: gemini,
                name: "Gemini Tracker",
                color: "",
                address: "",
                description: "",
                url: ""
            },
        ]
    }
]


const FinanceView = () => {
    const navigate = useNavigate();
    const { activeAccount, setContractAddress } = useAppContext();
    const [view, setView] = useState("kite");
    const { colorMode } = useColorMode();
    const [strategy, setStrategy] = useState("");
    const [category, setCategory] = useState(0);
    const [fetching, setFetching] = useState(true);
    const [clones, setClones] = useState<string[]>([]);

    const gradient =
        colorMode === "light" ?
            "linear-gradient(to bottom, transparent,transparent, transparent,transparent, transparent, rgba(6, 136, 72, 0.1), rgba(6, 136, 72, 0.2), rgba(6, 136, 72, 0.5))" :
            "linear-gradient(to bottom, transparent, transparent, transparent, transparent,transparent, rgba(6, 136, 72, 0.1), rgba(6, 136, 72, 0.2), rgba(6, 136, 72, 0.5))"
        ;



    const fetchClonesByStrategy = async () => {
        const chain = PegasusRPC
        const privateKey = activeAccount?.privateKey;
        if (!privateKey) {
            return;
        }
        try {
            const provider = new ethers.JsonRpcProvider(chain);
            const connectedWallet = new Wallet(privateKey, provider);
            const abi = KiteArtifact.abi;
            const contractAddress = KiteContract;
            const contract = new ethers.Contract(contractAddress, abi, connectedWallet);
            const _clones = await contract.getPoolsByStrategies(finance[category].items.filter((x) => x.name === strategy)[0].address);
            console.log("found clones via finanace page", _clones);
            setClones(_clones)
            setFetching(false);
            return _clones;
        } catch (e) {
            console.log("error fetching clones", e);
            setFetching(false);
        }
    }


    useEffect(() => {
        if (strategy.length > 0 && fetching) {
            fetchClonesByStrategy()
        }
    }, [strategy])


    switch (view) {
        case "kite":
            return (
                <>
                    {/* <Box
                        p="4"
                        borderRadius={"12px"}
                        // bg={"rgba(50, 143, 93, 0.3)"}
                        bg={`url(${rect})`}
                    >
                        <HStack
                            color="white"
                            fontWeight={"semibold"}
                            justifyContent={"center"} alignItems={"center"} spacing={3}>   <Text textAlign={"center"}>Better ways to Save & Invest</Text>
                            <FiExternalLink /></HStack>         
                    </Box > */}

                    {/* <Box
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        bottom="0"
                        bg={colorMode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
                        backdropFilter="blur(12px)"
                        zIndex="-1"
                    /> */}



                    <Box>
                        {
                            finance.map((feature, index) => (
                                <Box
                                    key={index}>
                                    <Text
                                        opacity={0.9}
                                        fontWeight={"semibold"}
                                        pb={4} fontSize={"sm"} pt={8}>• {feature.title}</Text>
                                    <HStack
                                        alignItems={"center"}
                                        justifyContent={index === 0 ? "space-around" : 'flex-start'}>
                                        {feature.items.map((pool, i) => (
                                            <Card
                                                key={i}
                                                alignSelf={"flex-start"}
                                                borderRadius={"12px"}
                                                bg={colorMode === "light" ? "blackAlpha.200" : "whiteAlpha.200"}
                                                boxShadow={"sm"}
                                                cursor={"pointer"}
                                                h="100px"
                                                w="100px"
                                                opacity={index === 2 ? 0.2 : 1}
                                                onClick={() => {
                                                    if (index !== 2) {
                                                        setFetching(true);
                                                        setCategory(index);
                                                        setStrategy(pool.name);
                                                        setView("pools");
                                                    }
                                                }}
                                            >
                                                <Box
                                                    position="absolute"
                                                    top="0"
                                                    left="0"
                                                    right="0"
                                                    bottom="0"
                                                    bg={colorMode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
                                                    borderRadius={"12px"}
                                                    backdropFilter="blur(12px)"
                                                    zIndex="-1"
                                                />


                                                {/* <VStack> */}
                                                <Box
                                                    py={0}
                                                    px={2}
                                                    borderLeft={"12px"}
                                                >
                                                    <Image
                                                        ml={4}
                                                        mt={2}
                                                        h="50px"
                                                        w="50px"
                                                        opacity={0.6}
                                                        position={"absolute"}
                                                        //@ts-ignore
                                                        src={pool.img!}
                                                        alt={`pool ${i} `}

                                                    />
                                                </Box>
                                                {/* </VStack> */}
                                                <Center
                                                    h="100%"
                                                    borderBottomRadius={"12px"}
                                                    bg={gradient}
                                                    pt={6}
                                                    px={2}
                                                >
                                                    <Text
                                                        mt={3}
                                                        fontWeight="bold"
                                                        zIndex={1}
                                                        color={
                                                            colorMode === "light" ? "#333" : "whiteAlpha.900"
                                                        }
                                                        fontSize={"sm"}
                                                    >{pool.name}</Text>
                                                </Center>
                                            </Card>
                                        ))}
                                    </HStack>
                                </Box>
                            ))
                        }

                    </Box>
                </>
            );

        case "pools":
            return (
                <>
                    {/* <Box>View Pool Details and Stats</Box> */}
                    <HStack py={3}>
                        <IconButton
                            onClick={() => {
                                setView("kite");
                                setClones([]);
                                setFetching(true);
                                setStrategy("");
                            }}
                            icon={<BiChevronLeft />} aria-label={"back-to-finance"} />
                        <Text fontWeight={"bold"}>{strategy}</Text>
                        <Popover>
                            <PopoverTrigger>
                                <Button
                                    bg='transparent'
                                ><FaEllipsisV /></Button>
                            </PopoverTrigger>
                            <PopoverContent w="fit-content">
                                <PopoverArrow />
                                <PopoverBody w="fit-content">
                                    <HStack
                                        as="a"
                                        href="https://github.com/acgodson/kite"
                                        target="_blank"
                                        display={"flex"} spacing={2} alignItems="center" fontSize={"xs"} fontWeight={"semibold"}>
                                        <Text
                                        >View Contract </Text><FaExternalLinkAlt />
                                    </HStack>
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>
                    </HStack>

                    <Card mt={2}
                        p={4}
                    >
                        <Image
                            mr={4}
                            mb={2}
                            right={0}
                            h="50px"
                            w="50px"
                            opacity={0.6}
                            position={"absolute"}
                            src={finance[category].items.filter((x) => x.name === strategy)[0].img}
                            alt={`pool ${strategy} `}

                        />
                        <Text
                            fontWeight={"semibold"} fontSize={"sm"}>{finance[category].items.filter((x) => x.name === strategy)[0].description}</Text>
                    </Card>

                    <Divider mt={8} />
                    <List mt={8}>
                        <ListItem>
                            <HStack
                                p={8}
                                _hover={{
                                    bg: colorMode === "light" ? "whiteAlpha.300" : "blackAlpha.100"
                                }}
                                w="100%" justifyContent={"space-between"}>

                                <List>
                                    {clones && clones.length > 0 && clones.map((x) => (
                                        <ListItem key={x}>
                                            <HStack w="100%" justifyContent={"space-between"}>
                                                <Flex fontSize={"sm"}>
                                                    1. <Text pl={2}>{shortenAddress(x)}</Text>
                                                </Flex>
                                                <Box>
                                                    <Box
                                                        as="a"
                                                        href={`https://pegasus.lighlink.io/contract/`}
                                                        target="_blank"
                                                    >
                                                        <FiExternalLink />
                                                    </Box>
                                                </Box>
                                            </HStack>
                                        </ListItem>
                                    ))}
                                </List>


                            </HStack>
                        </ListItem>
                    </List>

                </>
            );


        default:
            return <Box> View Error</Box>;
    }
};

export default FinanceView;
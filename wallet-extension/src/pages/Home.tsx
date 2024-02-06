import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { FaWallet, FaChartLine, FaCog, FaClock } from "react-icons/fa";
import SettingsView from "../components/Settings/Settings";
import HomeView from "../components/Wallet/HomeView";
import FinanceView from "../components/Wallet/Finance";
import ActivityView from "../components/Wallet/ActivityView";
import { motion } from "framer-motion";



const Home = () => {
 
    const panels = [
        <HomeView />,
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
        <FinanceView />
        </motion.div>,
        <ActivityView />,
        <SettingsView/>
    ];

    const navs = [
        <FaWallet />,
        <FaChartLine />,
        <FaClock />,
        <FaCog />
    ];


    return (
        <>
            <Tabs colorScheme="green" variant="enclosed-colored" isFitted h="600px">
                <Box h="550px" overflowY={"auto"}>
                    <TabPanels pt={12} minH="550px">
                        {panels.map((x, i) => (
                            <TabPanel key={`${i},${x}`}>
                                {x}
                            </TabPanel>
                        ))}
                    </TabPanels>
                </Box>

                <TabList
                    w="400px"
                    position={'fixed'}
                    h="50px">
                    {navs.map((x, i) => (
                        <Tab key={`${i},${x}`}>
                            {x}
                        </Tab>
                    ))}
                </TabList>
            </Tabs>

        </>


    );
};

export default Home;
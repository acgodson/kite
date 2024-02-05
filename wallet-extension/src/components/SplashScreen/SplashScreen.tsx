

import AnimatedSpinner from "../AnimatedSpinner";
import { Box, Grid, VStack, Center } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { motion } from "framer-motion";



const SplashScreen = () => {

    const [showSpinner, setShowSpinner] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSpinner(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { ease: "easeIn", duration: 1 } }}
        >
            <Box
                zIndex="tooltip"
                maxW="400px"
                w="100%"
                position={"absolute"}
                h="600px"
                bgGradient="linear(to bottom, black, #111e1d)"
                textAlign="center"
                fontSize="xl">

                <VStack h="100%" justifyContent="center" spacing={8}>
                    <Logo h="100px" pointerEvents="none" />
                    <>
                        <Center
                            display={!showSpinner ? "hide" : "flex"}
                            h="100px">
                            {showSpinner && (<AnimatedSpinner />)}
                        </Center>
                    </>
                </VStack>

            </Box>
        </motion.div>
    );
};

export default SplashScreen;
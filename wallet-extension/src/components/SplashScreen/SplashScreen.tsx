

import AnimatedSpinner from "../AnimatedSpinner";
import { Box, Grid, VStack, Center } from "@chakra-ui/react";


import React from "react";
import { Logo } from "./Logo";



const SplashScreen = () => {

    const [showSpinner, setShowSpinner] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setShowSpinner(true);
        }, 1000); // Set the delay to 3 seconds (3000 milliseconds)

        return () => clearTimeout(timer);
    }, []);
    return (
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
    );
};

export default SplashScreen;
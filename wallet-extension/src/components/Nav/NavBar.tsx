

import { Box, Image, Grid, VStack, Center, HStack } from "@chakra-ui/react";
import logo from "../../assets/logo.webp"

import { ColorModeSwitcher } from "./ColorModeSwitcher";

const NavBar = () => {
    return (
        <Box
            top={0}
            w="400px"
            position={"absolute"}
            h="50px"
            textAlign="center"
            fontSize="xl">
            <HStack pt={1} px={4} justifyContent="space-between">
                {/* <Image src={logo} h="30px" pointerEvents="none" /> */}
                <Box />
                <ColorModeSwitcher justifySelf="flex-end" />
            </HStack>
        </Box>
    );
};

export default NavBar;
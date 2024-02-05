import { Box } from "@chakra-ui/react";
import { useState, useEffect } from "react";

const PasswordValidator = ({ password, repeatPassword, children }: any) => {
    const [passwordMatch, setPasswordMatch] = useState(true);

    useEffect(() => {
        setPasswordMatch(password === repeatPassword);
    }, [password, repeatPassword]);

    return (
        <Box style={{ position: "relative" }}>
            {children}
            {!passwordMatch && (
                <Box
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        color: "red",
                        fontSize: "12px",
                    }}
                >
                    Passwords do not match
                </Box>
            )}
        </Box>
    );
};

export default PasswordValidator;
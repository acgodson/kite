import { HexString } from 'ethers/lib.commonjs/utils/data';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { Asset } from '../utils/types';


declare var chrome: any;

interface Account {
    address: string;
    privateKey: string;
}

type AppContextType = {
    showSplashScreen: boolean;
    setShowSplashScreen: React.Dispatch<React.SetStateAction<boolean>>;
    password: string;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    accounts: Account[] | any[];
    setAccounts: React.Dispatch<React.SetStateAction<Account[] | any[]>>;
    activeAccount: Account | null;
    setActiveAccount: React.Dispatch<React.SetStateAction<Account | null>>;
    balance: number | null;
    setBalance: React.Dispatch<React.SetStateAction<number | null>>;
    tokens: Asset[] | null | any[];
    setTokens: React.Dispatch<React.SetStateAction<Asset[] | null | any[]>>;
    recipient: string;
    setRecipient: React.Dispatch<React.SetStateAction<string>>;
    amount: string;
    setAmount: React.Dispatch<React.SetStateAction<string>>;

    selectedToken: string;
    setSelectedToken: React.Dispatch<React.SetStateAction<string>>;
    contractAddress: string | null;
    setContractAddress: React.Dispatch<React.SetStateAction<string | null>>;
    method: string | null;
    setMethod: React.Dispatch<React.SetStateAction<string | null>>;
    params: any[] | any;
    setParams: React.Dispatch<React.SetStateAction<any[] | any>>;
    // selectedClone: string;
    // setSelectedClone: React.Dispatch<React.SetStateAction<string>>;

    index: number;
    setIndex: React.Dispatch<React.SetStateAction<number>>;
    roundedUpAmount: number;
    setroundedUpAmount: React.Dispatch<React.SetStateAction<number>>;
    totalWithGas: number;
    settotalWithGas: React.Dispatch<React.SetStateAction<number>>;
    gasEstimate: number;
    setGasEstimate: React.Dispatch<React.SetStateAction<number>>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppProviderProps = {
    children: ReactNode;
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {

    const location = useLocation();

    //app states
    const [showSplashScreen, setShowSplashScreen] = useState(false);

    //account states
    const [password, setPassword] = useState("gamer");
    const [accounts, setAccounts] = useState<Account[] | any[]>([])
    const [activeAccount, setActiveAccount] = useState<Account | null>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const [tokens, setTokens] = useState<Asset[] | null | any[]>(null);

    //transaction states
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState("0");
    const [selectedToken, setSelectedToken] = useState("ETH");

    const [contractAddress, setContractAddress] = useState<string | null>(null)
    const [method, setMethod] = useState<string | null>(null)
    const [params, setParams] = useState<any>([])



    const [index, setIndex] = useState(0);
    const [roundedUpAmount, setroundedUpAmount] = useState(0);
    const [totalWithGas, settotalWithGas] = useState(0);
    const [gasEstimate, setGasEstimate] = useState(0);
    const navigate = useNavigate();


    useEffect(() => {
        // Check for existing accounts in storage
        storage.local.get('accounts', (result: any) => {
            const storedAccounts = result.accounts || [];
            setAccounts(storedAccounts);
            if (storedAccounts.length > 0) {
                // If accounts exist, navigate to the home page instead of the lock page
                console.log(storedAccounts);
                if (storedAccounts.length !== accounts.length) {
                    //we need to move to lock screen
                    setShowSplashScreen(false);
                    navigate("/lock");
                }

            } else {
                setShowSplashScreen(true);
                //check current path
                if (
                    !showSplashScreen && location.pathname === "/") {
                    const timer = setTimeout(() => {
                        setShowSplashScreen(false);
                    }, 4000);
                    return () => clearTimeout(timer);
                }
            }
        });
    }, [])


    const contextValue: AppContextType = {
        showSplashScreen,
        setShowSplashScreen,
        password,
        setPassword,
        accounts,
        setAccounts,
        activeAccount,
        setActiveAccount,
        balance,
        setBalance,
        tokens,
        setTokens,
        recipient,
        setRecipient,
        amount,
        setAmount,
        selectedToken,
        setSelectedToken,
        contractAddress,
        setContractAddress,
        method,
        setMethod,
        params,
        setParams,
        index,
        setIndex,
        roundedUpAmount,
        setroundedUpAmount,
        totalWithGas,
        settotalWithGas,
        gasEstimate,
        setGasEstimate,
    };

    return (
        <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

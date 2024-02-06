import { useState, useContext, useEffect } from 'react';
import { Wallet, ethers } from 'ethers';
import { useAppContext } from '../contexts/appContext';
import { useNavigate } from 'react-router-dom';
import { PegasusRPC, KiteContract, strategies } from '../utils/consts';
import KiteArtifact from "../utils/Kite.json";
import { Asset } from '../utils/types';

export const useStrategy = ({ strategy }: any) => {
    const navigate = useNavigate();
    const {
        activeAccount,
        tokens,
        setContractAddress,
        setMethod,
        setParams,
        setBalance,
        setAmount,
        pool,
        setPool,
        selectedToken,
        // setPrice
        // setPrice,
    } = useAppContext();
    const userAddress = activeAccount?.address;
    const [fetchingSavings, setFetchingSavings] = useState(false);
    const [clones, setClones] = useState<string[] | null>(null);
    const [selectedClone, setSelectedClone] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [optedIn, setOptedIn] = useState<any | null>(null);


    const fetchClonesByStrategy = async () => {
        const chain = PegasusRPC
        const privateKey = activeAccount?.privateKey;
        if (!privateKey) {
            return;
        }
        try {
            setFetchingSavings(true);
            const provider = new ethers.JsonRpcProvider(chain);
            const connectedWallet = new Wallet(privateKey, provider);
            const abi = KiteArtifact.abi;
            const contractAddress = KiteContract;
            const contract = new ethers.Contract(contractAddress, abi, connectedWallet);
            const _clones = await contract.getPoolsByStrategies(strategies[parseInt(strategy)].address);
            console.log("found clones", _clones);
            setClones(_clones)
            setFetchingSavings(false);
            return _clones;
        } catch (e) {
            console.log("error fetching clones", e);
            setBalance(0);
            // setPrice(0);
            setFetchingSavings(false);
        }
    }



    const fetchClonesByTokens = async () => {
        const chain = PegasusRPC
        const privateKey = activeAccount?.privateKey;
        const tokenAddress = tokens?.filter((x: Asset) => x.token.symbol === selectedToken)[0].token.address
        if (!privateKey) {
            return;
        }
        try {
            console.log("checking for this token", tokenAddress)
            const provider = new ethers.JsonRpcProvider(chain);
            const connectedWallet = new Wallet(privateKey, provider);
            const abi = KiteArtifact.abi;
            const contractAddress = KiteContract;
            const contract = new ethers.Contract(contractAddress, abi, connectedWallet);
            const _pool = await contract.getPoolByToken(tokenAddress);
            if (_pool && _pool !== ethers.ZeroAddress) {
                setOptedIn(_pool);
            } else {
                setOptedIn(null)
            }
            setFetchingSavings(false);
            // return _pool;
        } catch (e) {
            console.log("error fetching clones", e);
            setBalance(0);
            // setPrice(0);
            setFetchingSavings(false);
        }
    }

    const handleCreatePool = async () => {
        //cloning a strategy to create a new pool
        setContractAddress(KiteContract);
        setMethod("create");
        const _params = [
            strategies[parseInt(strategy)].address,
            [tokens?.filter((x: Asset) => x.token.symbol === selectedToken)[0].token.address]]
        setParams(_params)
        console.log("params for creating pool", _params);
        navigate("/confirm")
    }

    const handleOptIn = () => {
        setContractAddress(KiteContract);
        setMethod("optIn");

        const _index: any = tokens?.findIndex((token: Asset) => token.token.symbol === selectedToken);
        const _tokenBal: string = tokens![_index].value;
        const _bal = parseFloat((ethers.formatEther(_tokenBal!.toString())));

        setAmount(_bal.toString());
        const __days = Math.max(1, Math.ceil((selectedDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
        const daysInSeconds = __days * 24 * 60 * 60;
        //Pool,token,lockPeriod or amount
        const __params: any = [
            ethers.getAddress(selectedClone),
            tokens?.filter((x: Asset) => x.token.symbol === selectedToken)[0].token.address,
            ethers.parseUnits(daysInSeconds.toString(), 0)
        ]
        setParams(__params)
        console.log("params for opting in to pool", __params);
        navigate("/confirm")
    }

    const getPoolDetails = async () => {
        const chain = PegasusRPC  //chains_config[selectedChain]
        const privateKey = activeAccount?.privateKey;
        if (!privateKey || !optedIn) {
            return;
        }
        try {
            const provider = new ethers.JsonRpcProvider(chain);
            const connectedWallet = new Wallet(privateKey, provider);
            const erc20Abi = [
                "function balanceOf(address owner) view returns (uint256)"
            ];
            const poolAbi = [
                "function getTokenDetails(address token) external view returns (bool, uint256)",
                "function getShareholders(address token) external view returns (address[] memory, uint256[] memory)"
            ];

            const tokenAddress = tokens?.filter((x: Asset) => x.token.symbol === selectedToken)[0].token.address
            const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
            const poolContract = new ethers.Contract(optedIn, poolAbi, provider);

            // Get pool details
            const [isActive, unlockTimestamp] = await poolContract.getTokenDetails(tokenAddress);

            const unlockDate = new Date(Number(unlockTimestamp) * 1000); // Ensure timestamp is in milliseconds
            const formattedUnlockDate = unlockDate.toLocaleDateString('en-US', {
                day: "numeric",
                month: 'long',
                year: 'numeric'
            });
            console.log(formattedUnlockDate)
            const totalSupply = await tokenContract.balanceOf(optedIn);
            const formattedTotalSupply = ethers.formatEther(totalSupply);
            const [addresses, shares] = await poolContract.getShareholders(tokenAddress);

            let myShare = 0;
            const index = addresses.findIndex((address: string) => address.toLowerCase() === userAddress?.toLowerCase());
            if (index !== -1) {
                myShare = parseFloat(ethers.formatEther(shares[index]));
            }

            const _pool = {
                address: optedIn,
                status: isActive ? "Active" : "Inactive",
                unlock: formattedUnlockDate,
                totalSupply: formattedTotalSupply,
                myShare: myShare
            };

            if (_pool) {
                console.log("pool details", _pool)
                setPool(_pool)
            }
            return _pool;
        } catch (e) {
            console.log("error fetching balance", e)
            setBalance(0);
            // setPrice(0);
        }

    }

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = new Date(event.target.value);
        const today = new Date();
        const timeDiff = selected.getTime() - today.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        // Ensure the minimum date is the next day
        const minDate = new Date(today);
        minDate.setDate(minDate.getDate() + 1);

        if (selected < minDate) {
            setSelectedDate(minDate);
        } else {
            setSelectedDate(selected);
        }
    };



    useEffect(() => {
        if (!fetchingSavings && strategy && !clones && !optedIn) {
            fetchClonesByStrategy();
        }
    }, [fetchingSavings, strategy, clones, optedIn]);


    useEffect(() => {
        if (
            // view === "savings"   
            // && 
            selectedToken && !optedIn && fetchingSavings) {
            fetchClonesByTokens();
        }

    }, [
        // view, 
        fetchingSavings,
        optedIn,
        selectedToken]);



    return {
        fetchingSavings,
        setFetchingSavings,
        clones,
        setClones,
        selectedClone,
        setSelectedClone,
        selectedDate,
        setSelectedDate,
        optedIn,
        setOptedIn,
        fetchClonesByStrategy,
        fetchClonesByTokens,
        handleOptIn,
        handleCreatePool,
        getPoolDetails,
        handleDateChange
    };
};
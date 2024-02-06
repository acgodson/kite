import { useState, useEffect, useContext } from 'react';
import { Wallet, ethers } from 'ethers';
import { useAppContext } from '../contexts/appContext';
import { PegasusRPC, KiteContract } from '../utils/consts';
import { fetchCryptoPriceInUSD } from '../utils/helpers';
import { Asset } from '../utils/types';

export const useWallet = () => {
    const {
        activeAccount,
        balance,
        setBalance,
        tokens,
        setTokens,
        fetching,
        setFetching
    } = useAppContext();

    const [price, setPrice] = useState<number | any>(0);
    const priceApiKey = "44acbe2f2d147775185a828cf204ca20136e149a338310e0c09cd3176876cba0";

    const fetchTokens = async () => {
        if (!activeAccount?.address) return;
        const apiUrl = `https://pegasus.lightlink.io/api/v2/addresses/${activeAccount.address}/tokens?type=ERC-20%2CERC-721%2CERC-1155`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (response.ok) {
                const erc20Tokens = data.items.filter((token: Asset) => token.token.type === "ERC-20");
                for (const token of erc20Tokens) {
                    if (token.token.exchange_rate === null) {
                        token.token.exchange_rate = await fetchCryptoPriceInUSD(token.token.symbol, priceApiKey);
                    }
                    if (token.token.icon_url === null) {
                        token.token.icon_url = "logo";
                    }
                }
                setTokens(erc20Tokens);
            } else {
                console.error(`Failed to fetch data. Status code: ${response.status}`);
            }
        } catch (error: any) {
            console.error("Error during fetch:", error.message);
        }
    };




    const getBalance = async () => {
        const chain = PegasusRPC  //chains_config[selectedChain]
        const privateKey = activeAccount?.privateKey;
        console.log(privateKey);
        if (!privateKey) {
            return;
        }
        try {
            const provider = new ethers.JsonRpcProvider(chain);
            const connectedWallet = new Wallet(privateKey, provider);
            const balance = await connectedWallet.provider?.getBalance(activeAccount.address);
            console.log("Balance:", balance?.toString());
            //fix this
            const roundedBalance = parseFloat(ethers.formatEther(balance as any)).toFixed(Math.max(2, balance?.toString().split(".")[1]?.length || 0))
            setBalance(parseFloat(roundedBalance));
            const _price = await fetchCryptoPriceInUSD("ETH", priceApiKey);
            console.log("price", _price);
            const value = _price * Number(roundedBalance);
            setPrice(parseFloat(value.toFixed(2).toString()));
        } catch (e) {
            console.log("error fetching balance", e)
            setBalance(0);
            setPrice(0);
        }

    }



    useEffect(() => {
        if (activeAccount?.address) {
            if (!balance) {
                getBalance();
            } if (!tokens) {
                fetchTokens();
            }
        }
    }, [activeAccount?.address, balance, tokens]);

    return { fetchTokens, getBalance, price, setPrice };
};
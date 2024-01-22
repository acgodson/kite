import React, { useEffect, useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Input,
    Button,
    HStack,
    VStack,
    Text,
    List,
    ListItem,
} from '@chakra-ui/react';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { ethers } from 'ethers';
import coreFactory from '@/utils/core.json';
import GHOFactory from '@/utils/GHOToken.json';
import { useAccount } from 'wagmi';
import AnimatedSpinner from '../AnimatedSpinner';
import { FaCheckCircle } from 'react-icons/fa';
import { SiToptal } from 'react-icons/si';


declare global {
    interface Window {
        ethereum?: MetaMaskInpageProvider
    }
}

interface Campaign {
    id: number;
    interest: number;
    amount: string; // Add the 'amount' property here
}

export const AddBillModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
    const { address, isConnecting, isDisconnected } = useAccount();
    const [myCampaigns, setMyCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const getMyCampaigns = async () => {
        if (!address) {
            return
        }
        try {
            const { ethereum } = window;
            if (!ethereum) {
                //no web3 extension 
                return;
            }
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = provider.getSigner();
            const CoreAddress = "0xeFc6B96a9A3Db8B741e85DFFdCb8201Ae97C6380";

            const contract = new ethers.Contract(CoreAddress, coreFactory.abi, await signer);
            const campaignResult = await contract.getCampaignsByAddress(address);
            const campaigns = await Promise.all(
                campaignResult.map(async (campaignId: any) => {
                    return {
                        id: Number(campaignId.campaignId),
                        vaultAddress: campaignId.vaultAddress,
                        interestRate: Number(campaignId.interestRate),
                        paymentInterval: Number(campaignId.paymentInterval) == 0 ? "daily" : Number(campaignId.paymentInterval) == 2 ? "30 days" : "7 days",
                        splitsCount: Number(campaignId.splitsCount),
                    };
                })
            );
            return campaigns;
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            return [];
        }
    };


    useEffect(() => {
        const fetchCampaigns = async () => {
            const campaigns = await getMyCampaigns();
            setMyCampaigns(campaigns as any);
        };

        fetchCampaigns();
    }, []); // Run only once on component mount


    // Sample campaigns (replace with your data)
    const sampleCampaigns: Campaign[] = [
        { id: 1, interest: 5, amount: 'Value 1' },
        { id: 2, interest: 3, amount: 'Value 2' },
    ];

    const handleSearch = () => {
        // Implement search logic here based on searchQuery
        // Update the UI or state accordingly
    };

    const confirmPay = async (total: number, amount: number) => {
        try {
            const { ethereum } = window;
            if (!ethereum) {
                //no web3 extension
                return;
            }
            console.log(total, amount);
            // return

            const provider = new ethers.BrowserProvider(ethereum);
            const signer = provider.getSigner();
            const CoreAddress = "0xeFc6B96a9A3Db8B741e85DFFdCb8201Ae97C6380";
            const GHOTokenAddress = "0xc4bF5CbDaBE595361438F8c6a187bDc330539c60";


            const ghoTokenContract = new ethers.Contract(GHOTokenAddress, GHOFactory.abi, await signer);
            const coreContract = new ethers.Contract(CoreAddress, coreFactory.abi, await signer);


            // Check the current allowance
            const allowance = await ghoTokenContract.allowance(address, CoreAddress);

                // Not enough allowance, need to approve
                const approveTx = await ghoTokenContract.approve(CoreAddress, ethers.parseUnits(total.toString(), 'ether'));
                await approveTx.wait();
  
            const tx = await coreContract.initiateTrade(
                selectedCampaign.id,
                total,
                amount
            );
            const receipt = await tx.wait();

            // Check if the transaction was successful
            if (receipt.status === 1) {
                console.log('Transaction successful!');
                setSuccess(true);
                setLoading(false);
            } else {
                console.error('Transaction failed.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error submitting transaction:', error);
            setLoading(false);
        }
    }

    const handlePay = (campaign: Campaign) => {
        // Implement logic to initiate trade for the selected campaign
        // You can use this function to trigger the trade based on the selectedCampaign state
        console.log('Initiating trade for campaign:', campaign);
        if (!selectedCampaign || selectedCampaign < 1) {
            return
        }
        const totalAmount = parseFloat(selectedCampaign.amount);
        const interestRate = parseFloat(selectedCampaign.interestRate);
        const splitCount = parseFloat(selectedCampaign.splitsCount);

        // Calculate new total with interest
        const newTotal = Math.ceil(totalAmount + (totalAmount * interestRate / 100));

        // Calculate the first amount to be paid
        const firstAmount = Math.ceil(newTotal / splitCount);

        confirmPay(newTotal, firstAmount);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add Bill</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <Input
                            placeholder="Search Campaign by ID"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button onClick={handleSearch}>Search</Button>
                    </VStack>
                    <List mt={4} spacing={4}>
                        {myCampaigns.length > 0 && myCampaigns.map((campaign) => (
                            <ListItem key={campaign.id}>
                                <HStack spacing={4} justify="space-between">
                                    <VStack align="start">
                                        <HStack fontSize='xs'>
                                            <Text>Campaign: {campaign.id}</Text>
                                            <Text>Interest: {campaign.interestRate}%</Text>

                                            <Text>Duration: {campaign.paymentInterval}</Text>
                                            <Text>max: {campaign.splitsCount} times</Text>

                                        </HStack>
                                        {/* Add other properties as needed */}

                                    </VStack>
                                    <HStack>
                                        <Input w='100px'
                                            placeholder="Amount"
                                            type="number"
                                            onChange={(e) =>
                                                setSelectedCampaign({ ...campaign, amount: parseInt(e.target.value) })
                                            }
                                        />
                                        <Button onClick={() => handlePay(campaign)}>Pay</Button>
                                    </HStack>
                                </HStack>
                            </ListItem>
                        ))}
                    </List>
                </ModalBody>
                <ModalFooter>
                    {/* Add additional footer content if needed */}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
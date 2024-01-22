import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputGroup,
  InputLeftElement,
  Center,
  Link,
  Icon
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { MetaMaskInpageProvider } from "@metamask/providers";
import coreFactory from '@/utils/core.json'
import AnimatedSpinner from '../AnimatedSpinner';
import { FaCheckCircle } from 'react-icons/fa';
import { useNetwork } from 'wagmi'
import { FiExternalLink } from 'react-icons/fi';


declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider
  }
}

interface ExternalLinkProps {
  url: string;
}



const CreateCampaignModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [interestRate, setInterestRate] = useState(3);
  const [vaultAddress, setVaultAddress] = useState('0x8821A0696597554a4E58D0773776DCEA9E12c649');
  const [paymentInterval, setPaymentInterval] = useState('0');
  const [splitsCount, setSplitsCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hash, setHash] = useState("")
  const { chain } = useNetwork();

  const openExternalLink = () => {
    const url = chain?.name !== "Sepolia" ? `https://ccip.chain.link/msg/${hash}` : `https://sepolia.etherscan.io/tx/${hash}`;
    window.open(url, '_blank');
  };


  async function submitTransaction(
  ) {
    try {
      const { ethereum } = window;
      if (!ethereum || !chain) {
        //no web3 extension
        return;
      }
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = provider.getSigner();
      const CoreAddress = chain.name === 'Sepolia' ? "0xdAc9b8D2e3698f247CAad793e2227461d6AE7D1b" : "0x2385F57Aa8044795c46dbc8aD55c83C31db5BB49"; //sepolia or Avalanche

      const contract = new ethers.Contract(CoreAddress, coreFactory.abi, await signer);
      const tx = await contract.createCampaign(interestRate, vaultAddress, parseInt(paymentInterval), splitsCount);
      const receipt = await tx.wait();

      // Check if the transaction was successful
      if (receipt.status === 1) {
        console.log('Transaction successful!');
        const transactionHash = receipt.hash;
        console.log(receipt)
        setHash(transactionHash);
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


  function reset() {
    setSuccess(false);
    setLoading(false);
  }

  const handleCreateCampaign = async () => {
    if (!chain) {
      alert("network problem")
      return;
    }
    console.log('Creating campaign:', interestRate, vaultAddress, paymentInterval, splitsCount);
    setLoading(true)
    await submitTransaction();
  };

  const handleSplitsCountChange = (value: string) => {
    const newSplitsCount = parseInt(value);
    setSplitsCount(newSplitsCount);
  };

  useEffect(() => {
    console.log('current chain', chain?.name);
  }, [chain])


  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Campaign</ModalHeader>
        <ModalCloseButton />
        <ModalBody w='100%' maxW='700px' h='450px'>
          {!loading && !success && (
            <>
              <FormControl mb={4}>
                <FormLabel>Interest Rate</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Text>%</Text>
                  </InputLeftElement>

                  <Input
                    type="number"
                    placeholder="Enter interest rate"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                  />
                </InputGroup>

              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Choose Vault</FormLabel>
                <Select
                  placeholder="Select vault"
                  value={vaultAddress}
                  onChange={(e) => setVaultAddress(e.target.value)}
                >
                  <option value="0x8821A0696597554a4E58D0773776DCEA9E12c649">Aave GHO-vault</option>
                  {/* Add other vault options if needed */}
                </Select>
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Payment Interval</FormLabel>
                <Select
                  placeholder="Select payment interval"
                  value={paymentInterval}
                  onChange={(e) => setPaymentInterval(e.target.value)}
                >
                  <option value="0">Daily</option>
                  <option value="1">Weekly</option>
                  <option value="2">Monthly</option>
                </Select>
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Splits Count</FormLabel>
                <NumberInput
                  min={2}
                  value={splitsCount}
                  onChange={(valueString) => handleSplitsCountChange(valueString)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text mt={1}>Each payment would last for a maximum {splitsCount * (paymentInterval === '0' ? 1 : paymentInterval === '1' ? 7 : 30)} days.</Text>
              </FormControl>
            </>
          )}


          {loading && !success && (
            <>
              <Center h="100%">
                <AnimatedSpinner />
              </Center>
            </>
          )}

          {success && !loading && (
            <Box w="100%">
              <Center h="100%">
                <FaCheckCircle color="green" size={"50px"} />
              </Center>
              <br />
              <Text fontSize={"bold"} textAlign={"center"}>Campaign Created</Text>
              <Link
                justifyContent={"center"}
                color="blue" onClick={openExternalLink} display="flex" alignItems="center">
                View on
                {chain?.name === "Sepolia" ? " Explorer" : " CCIP Explorer"}
                <Icon as={FiExternalLink} ml={1} />
              </Link>
              <br />
              <Button onClick={reset}>Create Another Campaign</Button>
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          {!loading && !success && (
            <>
              <Button colorScheme="teal" mr={3} onClick={handleCreateCampaign}>
                Create Campaign
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateCampaignModal;

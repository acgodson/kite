import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { MetaMaskInpageProvider } from "@metamask/providers";
import coreFactory from '@/utils/core.json'
import AnimatedSpinner from '../AnimatedSpinner';
import { FaCheckCircle } from 'react-icons/fa';


declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider
  }
}
const CreateCampaignModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [interestRate, setInterestRate] = useState(3);
  const [vaultAddress, setVaultAddress] = useState('0x2f35247bF78b64Ed879770a78dF5630a2584946F');
  const [paymentInterval, setPaymentInterval] = useState('0');
  const [splitsCount, setSplitsCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);


  async function submitTransaction(
  ) {
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
      const tx = await contract.createCampaign(interestRate, vaultAddress, parseInt(paymentInterval), splitsCount);
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


  function reset() {
    setSuccess(false);
    setLoading(false);
  }

  const handleCreateCampaign = async () => {
    console.log('Creating campaign:', interestRate, vaultAddress, paymentInterval, splitsCount);
    setLoading(true)
    await submitTransaction();
  };

  const handleSplitsCountChange = (value: string) => {
    const newSplitsCount = parseInt(value);
    setSplitsCount(newSplitsCount);
  };

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
                  <option value="0x2f35247bF78b64Ed879770a78dF5630a2584946F">Aave GHO-vault</option>
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
            <>
              <Center h="100%">
                <FaCheckCircle color="green" size={"50px"} />
              </Center>
              <br />
              <Text fontSize={"bold"} textAlign={"center"}>Campaign Added</Text>
              <Button onClick={reset}>New Campaign</Button>
            </>
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
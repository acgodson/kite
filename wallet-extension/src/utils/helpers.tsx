


export const shortenAddress = (address: string, startLength: number = 5, endLength: number = 4): string => {
    if (address.length < startLength + endLength + 2) {
      return address; // Return the original address if it's too short
    }
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
  };
  
  // Example usage
  const originalAddress = "0x1a2b3c4d5e6f7g8h9i0j";
  const shortenedAddress = shortenAddress(originalAddress);
  console.log(shortenedAddress); // Output: 0x1a2b3...i0j
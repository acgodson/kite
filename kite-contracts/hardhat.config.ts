import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// import "@nomicfoundation/hardhat-verify";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: false,
        runs: 200,
      },
    },
  },
  defaultNetwork: "pegasus",

  networks: {
    pegasus: {
      url: `https://replicator.pegasus.lightlink.io/rpc/v1`,

      accounts: [
        process.env.PRIVATE_KEY!,
      ],
    },
  },
};

export default config;

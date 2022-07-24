import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as dotEnvConfig } from 'dotenv';
dotEnvConfig();
const { DEPLOY_PRIVATE_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  paths:{
    artifacts: './artifacts'
  },
  networks: {
    testnet:{
      url: 'http://bops.morpheuslabs.io:29843',
      chainId: 2588,
      accounts: [ DEPLOY_PRIVATE_KEY! ], //sealer 1
      gas: 6000000,
      gasPrice: 1000000000
    }
  }
};

export default config;

/**
 * Environment Variables Required:
 * 
 * Network RPC URLs:
 * - SEPOLIA_RPC_URL: Sepolia testnet RPC URL
 * - MAINNET_RPC_URL: Ethereum mainnet RPC URL  
 * - POLYGON_RPC_URL: Polygon mainnet RPC URL
 * - ARBITRUM_RPC_URL: Arbitrum One mainnet RPC URL
 * - BSC_RPC_URL: BSC mainnet RPC URL
 * - INFURA_API_KEY: Infura project ID (fallback for RPC URLs)
 * 
 * Account Configuration:
 * - PRIVATE_KEY: Private key for deployment account
 * 
 * Block Explorer API Keys:
 * - ETHERSCAN_API_KEY: API key for Etherscan (Ethereum networks)
 * - POLYGONSCAN_API_KEY: API key for PolygonScan
 * - ARBISCAN_API_KEY: API key for Arbiscan (Arbitrum networks)
 * - BSCSCAN_API_KEY: API key for BscScan
 * 
 * Optional:
 * - REPORT_GAS: Set to any value to enable gas reporting
 */

import "@nomicfoundation/hardhat-toolbox";

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.24",
  networks: {
    // Local development network
    hardhat: {},
    
    // Ethereum Sepolia testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    
    // Ethereum mainnet
    mainnet: {
      url: process.env.MAINNET_RPC_URL || `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    
    // Polygon mainnet
    polygon: {
      url: process.env.POLYGON_RPC_URL || `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    
    // Arbitrum One mainnet
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    
    // BSC mainnet
    bsc: {
      url: process.env.BSC_RPC_URL || "https://bsc-dataseed1.binance.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  
  // Gas usage reporting configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  
  // Block explorer verification configuration
  etherscan: {
    apiKey: {
      // Ethereum networks (mainnet, sepolia, etc.)
      mainnet: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      
      // Polygon networks
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
      
      // Arbitrum networks
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      arbitrumSepolia: process.env.ARBISCAN_API_KEY,
      
      // BSC networks
      bsc: process.env.BSCSCAN_API_KEY,
      bscTestnet: process.env.BSCSCAN_API_KEY,
    },
  },
};

export default config;
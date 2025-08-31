# SEQICO Smart Contract Deployment

A Hardhat project for deploying the SEQICO ICO smart contract and SEQ token with MCP (Model Context Protocol) server support.

## Overview

This project contains:
- **SEQICO.sol**: The main ICO contract allowing token purchases with ETH, USDT, and USDC
- **SEQToken.sol**: The ERC20 token contract
- **Deployment scripts**: Two deployment scripts with different configurations
- **MCP Server**: Model Context Protocol server for enhanced interaction capabilities

## Features

### SEQICO Contract
- Buy SEQ tokens with ETH, USDT, or USDC
- Configurable pricing for each payment method
- Owner-only functions for token management and fund withdrawal
- Automatic ETH refunds for overpayments
- Event logging for all purchases

### SEQToken Contract
- Standard ERC20 token
- Initial distribution: 10% to owner, 90% to ICO contract
- 500,000 total supply

### MCP Server
- Tools for compiling and deploying contracts
- Contract information retrieval
- Deployment status checking
- Interactive prompts for deployment guidance

## Setup

1. Install dependencies:
```bash
npm install
```

2. Compile contracts:
```bash
npx hardhat compile
```

3. Deploy contracts:
```bash
# Deploy with main script
npx hardhat run scripts/deploy.js

# Deploy with alternative script  
npx hardhat run scripts/deploy-DE.js
```

## MCP Server Configuration

### Starting the MCP Server
```bash
npm run mcp-server
```

### Claude Desktop Integration
Add the following to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "scripts-deploy": {
      "command": "node",
      "args": ["/absolute/path/to/scripts-deploy.js/mcp-server.js"],
      "cwd": "/absolute/path/to/scripts-deploy.js"
    }
  }
}
```

Replace `/absolute/path/to/scripts-deploy.js` with the actual path to this project directory.

### Available MCP Tools
- `compile_contracts`: Compile smart contracts using Hardhat
- `deploy_contracts`: Deploy contracts using deployment scripts
- `get_contract_info`: Get information about contract source code
- `get_deployment_status`: Check compilation and deployment status

### Available MCP Prompts
- `deployment_guide`: Step-by-step deployment instructions
- `contract_interaction`: Guide for interacting with deployed contracts

## Contract Functions

### SEQICO Contract
- `buyWithETH(uint256 tokenAmount)`: Purchase tokens with ETH
- `buyWithUSDT(uint256 tokenAmount)`: Purchase tokens with USDT
- `buyWithUSDC(uint256 tokenAmount)`: Purchase tokens with USDC
- `setSEQToken(address _seqToken)`: Update SEQ token address (owner only)
- `withdrawETH(address payable recipient)`: Withdraw collected ETH (owner only)
- `withdrawERC20(address token, address recipient)`: Withdraw ERC20 tokens (owner only)

## Configuration

The deployment scripts include configurable parameters:
- Owner address
- USDT/USDC contract addresses
- Token pricing for ETH, USDT, and USDC
- Total supply (500,000 SEQ tokens)

## License

MIT

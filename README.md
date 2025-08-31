# SEQICO Smart Contract Deployment

A Hardhat project for deploying the SEQICO ICO smart contract and SEQ token.

## Overview

This project contains:
- **SEQICO.sol**: The main ICO contract allowing token purchases with ETH, USDT, and USDC
- **SEQToken.sol**: The ERC20 token contract
- **Deployment scripts**: Two deployment scripts with different configurations

## Features

### SEQICO Contract
- Buy SEQ tokens with ETH, USDT, or USDC
- Configurable pricing for each payment method
- Owner-only functions for token management, price updates, and fund withdrawal
- Automatic ETH refunds for overpayments
- Event logging for all purchases and price updates

### SEQToken Contract
- Standard ERC20 token
- Initial distribution: 10% to owner, 90% to ICO contract
- 500,000 total supply

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

## Contract Functions

### SEQICO Contract
- `buyWithETH(uint256 tokenAmount)`: Purchase tokens with ETH
- `buyWithUSDT(uint256 tokenAmount)`: Purchase tokens with USDT
- `buyWithUSDC(uint256 tokenAmount)`: Purchase tokens with USDC
- `setSEQToken(address _seqToken)`: Update SEQ token address (owner only)
- `setPricePerTokenETH(uint256 _pricePerTokenETH)`: Update ETH price per token (owner only)
- `setPricePerTokenUSDT(uint256 _pricePerTokenUSDT)`: Update USDT price per token (owner only)
- `setPricePerTokenUSDC(uint256 _pricePerTokenUSDC)`: Update USDC price per token (owner only)
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

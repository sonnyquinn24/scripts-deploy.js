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
- Configurable pricing for each payment method with $3 minimum enforcement
- Owner-only functions for token management and fund withdrawal
- Price setting functions with minimum validation
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

4. Set prices after deployment (optional):
```bash
# Update the SEQICO_ADDRESS in set-prices.js first
npx hardhat run scripts/set-prices.js
```

## Contract Functions

### SEQICO Contract
- `buyWithETH(uint256 tokenAmount)`: Purchase tokens with ETH
- `buyWithUSDT(uint256 tokenAmount)`: Purchase tokens with USDT
- `buyWithUSDC(uint256 tokenAmount)`: Purchase tokens with USDC
- `setSEQToken(address _seqToken)`: Update SEQ token address (owner only)
- `setPriceETH(uint256 _pricePerTokenETH)`: Set ETH price per token (owner only, >= $3 minimum)
- `setPriceUSDT(uint256 _pricePerTokenUSDT)`: Set USDT price per token (owner only, >= $3 minimum)
- `setPriceUSDC(uint256 _pricePerTokenUSDC)`: Set USDC price per token (owner only, >= $3 minimum)
- `withdrawETH(address payable recipient)`: Withdraw collected ETH (owner only)
- `withdrawERC20(address token, address recipient)`: Withdraw ERC20 tokens (owner only)

## Configuration

The deployment scripts include configurable parameters:
- Owner address
- USDT/USDC contract addresses
- Token pricing for ETH, USDT, and USDC
- Total supply (500,000 SEQ tokens)

### Price Floor Policy

The SEQICO contract enforces a **$3 minimum price** for all payment methods:

#### Price Minimums:
- **USDT/USDC**: 3,000,000 (representing $3.00 with 6 decimals)
- **ETH**: 0.001 ETH (assuming ETH > $3,000, this represents > $3.00)

#### Setting Prices:
- Prices can only be set by the contract owner
- All prices must meet the $3 minimum requirement
- Price updates emit `PriceUpdated` events
- Initial prices are validated during contract deployment

#### Examples:
```solidity
// Valid prices (>= $3 minimum)
setPriceUSDT(3_000_000);  // Exactly $3.00
setPriceUSDC(5_000_000);  // $5.00
setPriceETH(0.001 ether); // 0.001 ETH (assuming ETH > $3,000)

// Invalid prices (< $3 minimum) - these will revert
setPriceUSDT(2_000_000);  // $2.00 - too low!
setPriceETH(0.0005 ether); // 0.0005 ETH - too low!
```

To update prices after deployment, use the `scripts/set-prices.js` script.

## License

MIT

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
- Configurable pricing for each payment method with **$3 minimum price floor**
- Owner-only functions for token management and fund withdrawal
- Automatic ETH refunds for overpayments
- Event logging for all purchases
- **Price validation**: All token prices must be ≥ $3 equivalent:
  - ETH: minimum 3 ether (3 × 10¹⁸ wei)
  - USDT: minimum 3,000,000 (3 × 10⁶, accounting for 6 decimals)
  - USDC: minimum 3,000,000 (3 × 10⁶, accounting for 6 decimals)

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
- `setPricePerTokenETH(uint256 _pricePerTokenETH)`: Set ETH price per token (owner only, ≥ 3 ETH)
- `setPricePerTokenUSDT(uint256 _pricePerTokenUSDT)`: Set USDT price per token (owner only, ≥ 3,000,000)
- `setPricePerTokenUSDC(uint256 _pricePerTokenUSDC)`: Set USDC price per token (owner only, ≥ 3,000,000)
- `setSEQToken(address _seqToken)`: Update SEQ token address (owner only)
- `withdrawETH(address payable recipient)`: Withdraw collected ETH (owner only)
- `withdrawERC20(address token, address recipient)`: Withdraw ERC20 tokens (owner only)

## Price Floor Policy

The SEQICO contract enforces a **minimum price of $3** for SEQ tokens across all supported payment methods:

- **ETH**: Minimum 3 ether (3,000,000,000,000,000,000 wei)
- **USDT**: Minimum 3,000,000 (equivalent to $3 with 6 decimals)
- **USDC**: Minimum 3,000,000 (equivalent to $3 with 6 decimals)

This validation is applied in:
- Contract deployment (constructor)
- All price setter functions (`setPricePerTokenETH`, `setPricePerTokenUSDT`, `setPricePerTokenUSDC`)

Any attempt to set a price below these minimums will result in a transaction revert with the message: **"Price must be greater than or equal to $3"**

## Configuration

The deployment scripts include configurable parameters:
- Owner address
- USDT/USDC contract addresses
- Token pricing for ETH, USDT, and USDC (must meet $3 minimum requirement)
- Total supply (500,000 SEQ tokens)

**Note**: When deploying, ensure all price parameters meet the minimum $3 equivalent requirement, or the deployment will fail.

## License

MIT

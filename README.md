# SEQ Token Deployment Scripts

This repository contains smart contracts and deployment scripts for the SEQ Token ecosystem.

## Contracts

### SEQToken.sol
An ERC20 token contract that:
- Has the name "SEQ Token" and symbol "SEQ"
- Distributes tokens at deployment: 10% to owner, 90% to ICO contract
- Validates that neither owner nor ICO addresses are zero
- Inherits from OpenZeppelin's ERC20 implementation

### SEQICO.sol
A basic ICO contract that stores:
- Token contract address
- USDT and USDC contract addresses
- Price per token in ETH, USDT, and USDC

## Setup

1. Install dependencies:
```bash
npm install
```

2. Compile contracts:
```bash
npm run compile
```

3. Run tests:
```bash
npm run test
```

## Deployment

Deploy the contracts to a network:

```bash
# Deploy with main script
npm run deploy

# Deploy with alternative script
npm run deploy-alt
```

Both scripts deploy:
1. SEQICO contract first (with dummy token address)
2. SEQToken contract with 500,000 total supply (10% to owner, 90% to ICO)
3. Print token balances for verification

## Configuration

Update the deployment scripts in `scripts/` directory to modify:
- Owner address
- USDT/USDC contract addresses
- Token prices
- Total supply amount

## Contract Details

- **Total Supply**: 500,000 SEQ tokens
- **Owner Allocation**: 10% (50,000 SEQ)
- **ICO Allocation**: 90% (450,000 SEQ)
- **Solidity Version**: ^0.8.20
- **License**: MIT

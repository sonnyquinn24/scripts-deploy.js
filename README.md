# SEQICO Smart Contract Deployment

A Hardhat project for deploying the SEQICO ICO smart contract and SEQ token with automated GitHub Actions deployment.

## Overview

This project contains:
- **SEQICO.sol**: The main ICO contract allowing token purchases with ETH, USDT, and USDC
- **SEQToken.sol**: The ERC20 token contract
- **Deployment scripts**: Automated deployment scripts with deployer information logging
- **GitHub Actions**: Automated deployment pipeline triggered on main branch merges

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

### Automated Deployment
- GitHub Actions workflow triggers on main branch pushes
- Automated contract compilation and deployment
- Secure environment variable handling
- Deployment artifact uploads

## Setup

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. Compile contracts:
```bash
npm run compile
```

4. Deploy contracts:
```bash
# Deploy to local Hardhat network
npm run deploy

# Deploy to specific networks
npm run deploy:sepolia
npm run deploy:mainnet
npm run deploy:polygon
```

## GitHub Actions Deployment

### Required Secrets
Configure these secrets in your GitHub repository:
- `PRIVATE_KEY`: Your deployment account's private key
- `INFURA_API_KEY`: Your Infura project API key
- `NETWORK`: Target network (hardhat, mainnet, sepolia, polygon)

### Workflow Trigger
The deployment workflow automatically triggers when:
- Code is pushed to the `main` branch
- All contracts are compiled and deployed to the specified network
- Deployment artifacts are uploaded for review

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

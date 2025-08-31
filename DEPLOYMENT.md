# SEQ Token Deployment Guide

## Prerequisites

1. **Node.js** version 18 or higher
2. **NPM** or **Yarn** package manager
3. **Hardhat** development environment
4. **Private keys** for deployment accounts
5. **RPC endpoints** (Infura, Alchemy, etc.)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/sonnyquinn24/scripts-deploy.js.git
cd scripts-deploy.js
npm install --legacy-peer-deps
```

### 2. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Add your private keys (without 0x prefix)
- Configure RPC endpoints (Infura API key)
- Set contract addresses for each network
- Adjust pricing parameters (must meet $3 minimum for USDT/USDC)

### 3. Compilation and Testing

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Run linting
npm run lint
```

## Deployment Process

### Local Development

```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet Deployment

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

### Mainnet Deployment

```bash
# Deploy to Ethereum mainnet
npx hardhat run scripts/deploy.js --network mainnet

# Deploy to Base
npx hardhat run scripts/deploy.js --network base

# Deploy to Arbitrum
npx hardhat run scripts/deploy.js --network arbitrum
```

## Price Validation Rules

The SEQICO contract enforces the following price validation:

- **USDT Price**: Must be ≥ $3.00 USD (3,000,000 with 6 decimals)
- **USDC Price**: Must be ≥ $3.00 USD (3,000,000 with 6 decimals)
- **ETH Price**: No minimum validation (due to volatility)

### Price Update Examples

```solidity
// Valid price updates (owner only)
await seqico.updatePriceUSDT(4000000);  // $4.00
await seqico.updatePriceUSDC(3500000);  // $3.50
await seqico.updatePriceETH(ethers.parseEther("0.002"));  // 0.002 ETH

// Invalid - will revert
await seqico.updatePriceUSDT(2000000);  // $2.00 - below minimum
```

## CI/CD Deployment

The project includes automated deployment via GitHub Actions:

### Automatic Deployment Triggers

1. **Testnet**: Automatic deployment on push to `main` branch
2. **Mainnet**: Manual deployment via `workflow_dispatch` trigger

### Required Secrets

Configure these secrets in your GitHub repository:

```
TESTNET_PRIVATE_KEY=<private_key_for_testnet>
MAINNET_PRIVATE_KEY=<private_key_for_mainnet>  
INFURA_API_KEY=<your_infura_api_key>
ETHERSCAN_API_KEY=<your_etherscan_api_key>
```

### Manual Mainnet Deployment

1. Go to GitHub Actions → CI/CD Pipeline
2. Click "Run workflow"
3. Confirm mainnet deployment

## Post-Deployment Verification

### 1. Contract Verification on Etherscan

```bash
npx hardhat verify --network mainnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### 2. Functional Testing

Test the deployed contracts:

```bash
# Test price validation
node scripts/test-deployment.js

# Test token purchases
node scripts/test-purchases.js
```

### 3. Ownership Transfer (if needed)

```solidity
// Transfer ownership to multisig or final owner
await seqico.transferOwnership(newOwnerAddress);
await seqToken.transferOwnership(newOwnerAddress);
```

## Security Considerations

1. **Private Key Security**: Never commit private keys to version control
2. **Price Validation**: Always verify prices meet minimum requirements
3. **Access Control**: Ensure proper ownership setup
4. **Testing**: Run comprehensive tests before mainnet deployment
5. **Multi-sig**: Consider using multi-signature wallets for ownership

## Troubleshooting

### Common Issues

1. **Compilation Errors**: Check Node.js version compatibility
2. **Gas Estimation Failures**: Verify network connectivity and account balance
3. **Price Validation Failures**: Ensure USDT/USDC prices ≥ $3.00
4. **Permission Errors**: Verify private key and account permissions

### Support Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethereum Documentation](https://ethereum.org/en/developers/docs/)

## Contract Addresses

After deployment, update this section with deployed contract addresses:

### Mainnet
- SEQToken: `<TO_BE_DEPLOYED>`
- SEQICO: `<TO_BE_DEPLOYED>`

### Sepolia Testnet
- SEQToken: `<TO_BE_DEPLOYED>`
- SEQICO: `<TO_BE_DEPLOYED>`

### Base Mainnet
- SEQToken: `<TO_BE_DEPLOYED>`
- SEQICO: `<TO_BE_DEPLOYED>`

### Arbitrum Mainnet
- SEQToken: `<TO_BE_DEPLOYED>`
- SEQICO: `<TO_BE_DEPLOYED>`
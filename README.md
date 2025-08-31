# SEQICO Smart Contract Deployment

A Hardhat project for deploying the SEQICO ICO smart contract and SEQ token with automated CI/CD pipeline using GitHub Actions.

## Overview

This project contains:
- **SEQICO.sol**: The main ICO contract allowing token purchases with ETH, USDT, and USDC
- **SEQToken.sol**: The ERC20 token contract
- **Deployment scripts**: Automated deployment with network-specific configurations
- **Comprehensive tests**: Full test suite for contract functionality
- **CI/CD Pipeline**: Automated build, test, and deployment using GitHub Actions

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

### CI/CD Pipeline
- **Build Stage**: Compile contracts with dependency caching
- **Test Stage**: Run comprehensive test suite
- **Security Stage**: NPM audit and security checks
- **Deploy Stage**: Automated deployment to multiple networks with environment protection
- **Verification**: Contract verification on block explorers

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
npm test
```

## Deployment

### Environment Variables

Set up the following environment variables or GitHub secrets:

```bash
# Required for all networks
PRIVATE_KEY=your_wallet_private_key
OWNER_ADDRESS=your_owner_address

# For Ethereum networks (Mainnet/Sepolia)
INFURA_API_KEY=your_infura_api_key
MAINNET_RPC_URL=https://mainnet.infura.io/v3/your_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# For other networks
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your_key
BSC_RPC_URL=https://bsc-dataseed1.binance.org
```

### Local Deployment

```bash
# Deploy to local Hardhat network
npm run deploy

# Deploy to specific networks
npm run deploy:sepolia
npm run deploy:mainnet
npm run deploy:polygon
npm run deploy:bsc
```

### Automated Deployment via GitHub Actions

The CI/CD pipeline supports multiple deployment scenarios:

#### 1. Automatic Testnet Deployment
- Triggers on pushes to `main` branch
- Automatically deploys to Sepolia testnet
- Runs after successful build and test stages

#### 2. Manual Production Deployment
- Use GitHub Actions manual trigger
- Select target network (sepolia, mainnet, polygon, bsc)
- Requires appropriate environment secrets
- Includes environment protection for production networks

#### 3. Pull Request Validation
- Runs build and test stages on PRs
- Ensures code quality before merging

### Deployment Artifacts

Each deployment generates:
- Deployment information JSON file with contract addresses
- Constructor parameters for verification
- Balance verification data
- Timestamp and network information

Files are saved to `deployments/` directory and uploaded as GitHub Actions artifacts.

## Contract Functions

### SEQICO Contract
- `buyWithETH(uint256 tokenAmount)`: Purchase tokens with ETH
- `buyWithUSDT(uint256 tokenAmount)`: Purchase tokens with USDT
- `buyWithUSDC(uint256 tokenAmount)`: Purchase tokens with USDC
- `setSEQToken(address _seqToken)`: Update SEQ token address (owner only)
- `withdrawETH(address payable recipient)`: Withdraw collected ETH (owner only)
- `withdrawERC20(address token, address recipient)`: Withdraw ERC20 tokens (owner only)

## Configuration

### Network Configurations

The project supports deployment to:
- **Hardhat**: Local development network
- **Sepolia**: Ethereum testnet
- **Mainnet**: Ethereum mainnet
- **Polygon**: Polygon mainnet
- **BSC**: Binance Smart Chain

### Token Pricing

Default pricing (configurable in deployment script):
- ETH: 0.01 ETH per SEQ token
- USDT: 10 USDT per SEQ token
- USDC: 10 USDC per SEQ token

### Token Distribution

- Total Supply: 500,000 SEQ tokens
- Owner: 50,000 SEQ (10%)
- ICO Contract: 450,000 SEQ (90%)

## Security

### Access Control
- Owner-only functions protected by OpenZeppelin's Ownable
- Multi-network deployment with environment-specific configurations
- Private key management through GitHub Secrets

### Testing
- Comprehensive test suite covering all major functions
- Access control testing
- Edge case validation
- Automated testing in CI/CD pipeline

## Development Workflow

1. **Local Development**
   ```bash
   npm run compile
   npm test
   npm run deploy  # Local testing
   ```

2. **Pull Request**
   - Create feature branch
   - Make changes and add tests
   - Open PR (triggers automated testing)

3. **Deployment**
   - Merge to main (triggers testnet deployment)
   - Manual production deployment via GitHub Actions

## Verification

After deployment, contracts can be verified using:
```bash
npx hardhat verify --network <network> <contract_address> <constructor_args>
```

Verification commands are automatically generated and displayed after deployment.

## License

MIT

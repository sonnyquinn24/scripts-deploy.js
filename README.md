# SEQICO Smart Contract Deployment

A Hardhat project for deploying the SEQICO ICO smart contract and SEQ token.

## Overview

This project contains:
- **SEQICO.sol**: The main ICO contract allowing token purchases with ETH, USDT, and USDC
- **SEQToken.sol**: The ERC20 token contract
- **Deployment scripts**: Two deployment scripts with different configurations
- **GitHub Actions Automation**: Script to pin GitHub Actions to full-length commit SHAs for improved security

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

### GitHub Actions Security Automation
Automated tool to pin GitHub Actions to full-length commit SHAs for improved security:

- **Automatic Detection**: Scans all workflow files for unpinned GitHub Actions
- **Safe Updates**: Fetches the latest commit SHAs and safely replaces version tags
- **Validation**: Ensures YAML remains valid after updates
- **Dry Run Mode**: Preview changes before applying them
- **Comprehensive Testing**: Full test suite with edge case handling

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

## GitHub Actions Security

### Pinning Actions to Commit SHAs

For improved security, this project includes automation to pin GitHub Actions to full-length commit SHAs instead of using version tags. This prevents potential supply chain attacks where malicious code could be injected into new versions of actions.

#### Usage

Preview what would be changed (recommended first):
```bash
npm run pin-actions -- --dry-run
```

Pin all GitHub Actions in workflow files:
```bash
npm run pin-actions
```

With GitHub token for better rate limits:
```bash
GITHUB_TOKEN=your_token_here npm run pin-actions
```

#### Features

- **Smart Detection**: Automatically finds all `.yml` and `.yaml` files in `.github/workflows/`
- **Version Resolution**: Resolves version tags (like `@v3`) to the latest patch version commit SHA
- **Selective Updates**: Only updates unpinned actions, skips already pinned ones
- **Error Handling**: Gracefully handles non-existent repositories and network issues
- **YAML Validation**: Ensures workflow files remain valid after updates
- **Caching**: Caches API responses to minimize GitHub API calls

#### Supported Action Formats

✅ **Will be pinned:**
- `actions/checkout@v3` → `actions/checkout@f43a0e5ff2bd294f1e76c1b0c63c18e4bd`
- `actions/setup-node@v3.8.1` → `actions/setup-node@60edb5d...`
- `company/action@main` → `company/action@abc123...`

❌ **Will be skipped (already secure):**
- `actions/checkout@f43a0e5ff2bd294f1e76c1b0c63c18e4bd` (already pinned)

#### Testing

Run the automation tests:
```bash
npm test
# or specifically
npm run test:pin-actions
```

The test suite covers:
- Workflow file discovery
- Action parsing and identification
- SHA resolution and replacement
- YAML validation
- Dry run functionality
- Error handling for edge cases

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

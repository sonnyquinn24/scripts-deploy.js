# SEQICO Smart Contract Deployment

A Hardhat project for deploying the SEQICO ICO smart contract and SEQ token.

## Overview

This project contains:
- **SEQICO.sol**: The main ICO contract allowing token purchases with ETH, USDT, and USDC
- **SEQToken.sol**: The ERC20 token contract
- **Deployment scripts**: Two deployment scripts with different configurations
- **GitHub Actions Security**: Automated pinning of GitHub Actions to commit SHAs for improved security

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
- `withdrawETH(address payable recipient)`: Withdraw collected ETH (owner only)
- `withdrawERC20(address token, address recipient)`: Withdraw ERC20 tokens (owner only)

## Configuration

The deployment scripts include configurable parameters:
- Owner address
- USDT/USDC contract addresses
- Token pricing for ETH, USDT, and USDC
- Total supply (500,000 SEQ tokens)

## GitHub Actions Security

This repository includes an automated script to pin GitHub Actions to their full-length commit SHAs for improved security. This prevents supply chain attacks where action tags could be moved to malicious commits.

### Using the GitHub Actions Pinner

The pinning script is located at `scripts/pin-github-actions.js` and can be used as follows:

```bash
# Run in dry-run mode to see what would be changed
node scripts/pin-github-actions.js --dry-run --verbose

# Pin all GitHub Actions to commit SHAs
node scripts/pin-github-actions.js --verbose

# Get help
node scripts/pin-github-actions.js --help
```

### Features

- **Automatic Detection**: Scans all workflow files in `.github/workflows/`
- **Smart Filtering**: Only processes GitHub-hosted actions, skips local and already-pinned actions
- **Safe Updates**: Validates YAML syntax after updates
- **Dry Run Mode**: Preview changes before applying them
- **Comprehensive Logging**: Detailed output with `--verbose` flag
- **Error Handling**: Graceful handling of non-existent actions or API failures

### Environment Variables

- `GITHUB_TOKEN`: Optional GitHub personal access token to avoid rate limits

### Testing

Run the test suite to validate the pinning functionality:

```bash
node test/pin-github-actions.test.js
```

### Example Output

```
🔍 Scanning for GitHub Actions to pin...
📍 Found 2 unique actions to pin:
  - actions/checkout@v3
  - actions/setup-node@v3

🔗 Fetching latest commit SHAs...
✓ actions/checkout@v3 → f43a0e5ff2bd294095638e18286ca9a3d1956744
✓ actions/setup-node@v3 → 3235b876344d2a9aa001b8d1453c930bba69e610

📝 Updating workflow files...
✓ Updated ci-cd.yml (6 changes)

🎯 Successfully pinned 6 actions in 1 files.
```

## License

MIT

# SeqIco Smart Contract Deployment

A Hardhat project for deploying the SeqIco ICO smart contract and SEQ token.

## Naming Conventions

This project follows strict naming conventions:

- **Files and directories**: kebab-case (e.g., `deploy-de.js`, `seq-ico.sol`)
- **Contract names**: PascalCase (e.g., `SeqIco`, `SeqToken`)
- **Variables and functions**: camelCase (e.g., `seqToken`, `setSeqToken`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `OWNER`, `ICO_ADDRESS`)

## Overview

This project contains:
- **seq-ico.sol**: The main ICO contract allowing token purchases with ETH, USDT, and USDC
- **seq-token.sol**: The ERC20 token contract
- **Deployment scripts**: Two deployment scripts with different configurations

## Features

### SeqIco Contract
- Buy SEQ tokens with ETH, USDT, or USDC
- Configurable pricing for each payment method
- Owner-only functions for token management and fund withdrawal
- Automatic ETH refunds for overpayments
- Event logging for all purchases

### SeqToken Contract
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
npx hardhat run scripts/deploy-de.js
```

## Contract Functions

### SeqIco Contract
- `buyWithETH(uint256 tokenAmount)`: Purchase tokens with ETH
- `buyWithUSDT(uint256 tokenAmount)`: Purchase tokens with USDT
- `buyWithUSDC(uint256 tokenAmount)`: Purchase tokens with USDC
- `setSeqToken(address _seqToken)`: Update SEQ token address (owner only)
- `withdrawETH(address payable recipient)`: Withdraw collected ETH (owner only)
- `withdrawERC20(address token, address recipient)`: Withdraw ERC20 tokens (owner only)

## Configuration

The deployment scripts include configurable parameters:
- Owner address
- USDT/USDC contract addresses
- Token pricing for ETH, USDT, and USDC
- Total supply (500,000 SEQ tokens)

## Recent Changes

See [CHANGELOG.md](CHANGELOG.md) for detailed information about the recent naming convention refactoring.

## License

MIT

# SEQICO Smart Contract Deployment

A Hardhat project for deploying the SEQICO ICO smart contract and SEQ token with automated configuration management, code quality enforcement, and comprehensive CI/CD.

## Overview

This project contains:
- **SEQICO.sol**: The main ICO contract allowing token purchases with ETH, USDT, and USDC
- **SEQToken.sol**: The ERC20 token contract
- **Automated deployment scripts**: Environment-based deployment with configuration management
- **Code quality tools**: ESLint with naming conventions and pre-commit hooks
- **CI/CD pipeline**: Comprehensive GitHub Actions workflow
- **Documentation**: Auto-generated JSDoc documentation

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

### Automated Configuration
- **Environment-based deployment**: Separate scripts for development and production
- **Environment variable validation**: Ensures all required configuration is present
- **Secure configuration management**: Uses dotenv for sensitive data
- **Code quality enforcement**: ESLint with naming conventions (camelCase, PascalCase, SCREAMING_SNAKE_CASE)
- **Pre-commit hooks**: Husky integration prevents non-conforming code
- **Auto-generated documentation**: JSDoc integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment configuration:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Compile contracts:
```bash
npm run compile
```

## Environment Configuration

Copy `.env.example` to `.env` and configure the following variables:

- `OWNER_ADDRESS`: Contract owner address
- `USDT_ADDRESS`: USDT contract address
- `USDC_ADDRESS`: USDC contract address  
- `PRICE_PER_TOKEN_ETH`: Price in wei per token for ETH purchases
- `PRICE_PER_TOKEN_USDT`: Price in USDT units per token
- `PRICE_PER_TOKEN_USDC`: Price in USDC units per token
- `TOTAL_SUPPLY`: Total token supply in wei

## Deployment

### Development Environment
```bash
npm run deploy:dev
```

### Production Environment
```bash
npm run deploy:prod
```

Both commands automatically:
- Validate environment variables
- Deploy SEQICO contract
- Deploy SEQToken contract
- Configure contract relationships
- Verify token distribution

## Code Quality

### Linting
```bash
# Check code style
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Naming Conventions (Enforced by ESLint)
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Variables**: `camelCase`
- **Contract factories/classes**: `PascalCase`

### Pre-commit Hooks
Code is automatically linted before commits. Non-conforming code will prevent commits.

## Documentation

Generate documentation:
```bash
npm run docs
```

Documentation is automatically generated from JSDoc comments and saved to `docs/`.

## Testing

Run validation tests:
```bash
npm test
```

## CI/CD Pipeline

The GitHub Actions workflow automatically:
- **Lints code** with ESLint
- **Compiles contracts** with Hardhat
- **Validates deployment scripts** and environment configuration
- **Generates documentation** on main branch updates
- **Runs dry-run deployments** for pull requests

## Contract Functions

### SEQICO Contract
- `buyWithETH(uint256 tokenAmount)`: Purchase tokens with ETH
- `buyWithUSDT(uint256 tokenAmount)`: Purchase tokens with USDT
- `buyWithUSDC(uint256 tokenAmount)`: Purchase tokens with USDC
- `setSEQToken(address _seqToken)`: Update SEQ token address (owner only)
- `withdrawETH(address payable recipient)`: Withdraw collected ETH (owner only)
- `withdrawERC20(address token, address recipient)`: Withdraw ERC20 tokens (owner only)

## Security Features

- Environment variable validation prevents deployment with missing configuration
- Pre-commit hooks ensure code quality
- Separate development and production deployment scripts
- Comprehensive CI/CD checks before deployment

## License

MIT

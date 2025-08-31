# SEQICO Smart Contract Deployment

SEQICO is a Hardhat-based project for deploying smart contracts for an ICO (Initial Coin Offering) and ERC20 token on Ethereum and compatible networks. The project contains SEQICO.sol (ICO contract) and SEQToken.sol (ERC20 token contract) with deployment scripts for different configurations.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap, Build, and Test the Repository:

```bash
# Install dependencies (required first step)
npm install
# TIMING: Takes 10-15 seconds. Set timeout to 60+ seconds if using --force flag.

# Compile smart contracts
npx hardhat compile
# TIMING: Takes 2-3 seconds for clean compile. NEVER CANCEL.

# Run tests (currently no tests defined, but validates setup)
npx hardhat test
# TIMING: Takes 1-2 seconds. Returns "0 passing (1ms)".

# Alternative commands using npm scripts:
npm run compile    # Same as npx hardhat compile
npm run test      # Same as npx hardhat test
```

### Deploy Smart Contracts:

```bash
# Deploy with main script (local network)
npx hardhat run scripts/deploy.js --network hardhat
# TIMING: Takes 1-2 seconds. NEVER CANCEL.

# Deploy with alternative script (local network)
npx hardhat run scripts/deploy-DE.js --network hardhat
# TIMING: Takes 1-2 seconds. NEVER CANCEL.

# Deploy using npm scripts:
npm run deploy     # Uses scripts/deploy.js
npm run deploy-de  # Uses scripts/deploy-DE.js

# For actual networks (requires environment variables):
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat run scripts/deploy.js --network mainnet
npx hardhat run scripts/deploy.js --network polygon
npx hardhat run scripts/deploy.js --network bsc
```

### Code Quality and Validation:

```bash
# Check code formatting (will show style issues)
npx prettier --check .
# TIMING: Takes 1-2 seconds.

# Format code automatically
npx prettier --write .
# TIMING: Takes 1-2 seconds.

# Solidity linting (requires .solhint.json config file)
npx solhint 'contracts/**/*.sol'
# TIMING: Takes 1-2 seconds. Will fail without config file.
```

## Validation

### Manual Testing Scenarios:

- **ALWAYS build and compile before making changes:** Run `npx hardhat compile` to ensure no syntax errors.
- **ALWAYS test deployment locally:** Run `npx hardhat run scripts/deploy.js --network hardhat` to validate deployment logic.
- **Verify contract functionality:** Check that SEQICO contract can receive the SEQ token address and that token balances are correctly distributed (10% owner, 90% ICO contract).
- **Environment setup validation:** For actual network deployment, ensure you have proper `PRIVATE_KEY`, `INFURA_API_KEY`, and network-specific RPC URLs configured.

### Critical Validation Steps:

1. Contracts must compile without errors
2. Deployment scripts must execute successfully on local network
3. Token distribution must be correct: 50,000 SEQ to owner, 450,000 SEQ to ICO contract
4. ICO contract must be properly updated with the real SEQ token address

## Environment Variables Required for Network Deployment

For deployment to actual networks, configure these environment variables:

- `PRIVATE_KEY`: Your wallet private key (without 0x prefix)
- `INFURA_API_KEY`: Your Infura project API key
- `ETHERSCAN_API_KEY`: For contract verification (optional)
- `SEPOLIA_RPC_URL`: Custom Sepolia RPC (optional, defaults to Infura)
- `MAINNET_RPC_URL`: Custom mainnet RPC (optional, defaults to Infura)
- `POLYGON_RPC_URL`: Custom Polygon RPC (optional, defaults to Infura)
- `BSC_RPC_URL`: Custom BSC RPC (optional, defaults to public endpoint)

## Timeout Guidelines

- **npm install**: Set timeout to 120+ seconds. NEVER CANCEL during dependency resolution.
- **npx hardhat compile**: Set timeout to 60+ seconds. Usually completes in 2-3 seconds but may take longer on first run.
- **Deployment scripts**: Set timeout to 60+ seconds. Usually completes in 1-2 seconds locally.
- **Network operations**: Set timeout to 300+ seconds for actual network deployments as they depend on network congestion.

## Common Tasks

### Repository Structure:

```
├── .github/
│   └── workflows/ci-cd.yml    # GitHub Actions CI/CD pipeline
├── contracts/
│   ├── SEQICO.sol            # Main ICO contract
│   └── SEQToken.sol          # ERC20 token contract
├── scripts/
│   ├── deploy.js             # Main deployment script
│   └── deploy-DE.js          # Alternative deployment script
├── hardhat.config.js         # Hardhat configuration
├── package.json              # Dependencies and npm scripts
└── README.md                 # Project documentation
```

### Key Files Summary:

#### contracts/SEQICO.sol

- ICO contract that allows purchasing SEQ tokens with ETH, USDT, or USDC
- Owner-only functions for token management and fund withdrawal
- Configurable pricing for each payment method

#### contracts/SEQToken.sol

- Standard ERC20 token with 18 decimals
- Total supply: 500,000 SEQ tokens
- Distribution: 10% to owner, 90% to ICO contract

#### scripts/deploy.js & scripts/deploy-DE.js

- Both scripts deploy the same contracts with identical functionality
- Deploy ICO contract first with dummy token address
- Deploy SEQ token with proper distribution
- Update ICO contract with real token address
- Print final balances for verification

### Dependencies and Versions:

- **Hardhat**: 2.19.5 (compatible version, do not upgrade to 3.x)
- **OpenZeppelin Contracts**: 5.4.0 (requires initialOwner parameter in constructors)
- **Node.js**: Project works with Node.js 20.x (Hardhat warning can be ignored)

### CI/CD Pipeline:

The `.github/workflows/ci-cd.yml` defines a 3-stage pipeline:

1. **Build**: Install dependencies and compile contracts
2. **Test**: Run test suite (currently empty but validates setup)
3. **Deploy**: Deploy to mainnet (requires secrets configuration)

### Troubleshooting:

#### Common Issues:

1. **"Cannot read properties of null"** during network deployment: Missing PRIVATE_KEY environment variable
2. **"Invalid config" errors**: Hardhat version compatibility issues (use 2.x, not 3.x)
3. **"No arguments passed to base constructor"**: OpenZeppelin v5 requires initialOwner parameter
4. **Prettier formatting warnings**: Expected and can be auto-fixed with `npx prettier --write .`

#### Version Compatibility:

- This project requires Hardhat 2.x and @nomicfoundation/hardhat-toolbox 2.x
- OpenZeppelin Contracts 5.x requires Ownable(initialOwner) constructor syntax
- Scripts use CommonJS require() syntax, not ES6 imports

### Quick Reference Commands:

```bash
# Setup and build
npm install && npx hardhat compile

# Local deployment test
npx hardhat run scripts/deploy.js --network hardhat

# Code formatting
npx prettier --write .

# Available networks
npx hardhat --help
```

## Project Context

This is a production-ready smart contract deployment project for the SEQICO token sale. The contracts implement:

- **Multi-currency support**: Accepts ETH, USDT, and USDC for token purchases
- **Automatic pricing**: Configurable exchange rates for each currency
- **Security features**: Owner-only functions, automatic ETH refunds for overpayments
- **Token distribution**: Predefined allocation between owner and ICO contract

Always test changes on local network before attempting mainnet deployment.

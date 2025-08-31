# SEQICO Smart Contract Deployment

This repository contains smart contracts for SEQICO ICO token sale system with SEQ ERC20 token. It includes ICO contract supporting purchases with ETH, USDT, and USDC, and deployment scripts for different configurations.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap, Build, and Test the Repository

1. **Install dependencies** (NEVER CANCEL - wait up to 5 minutes):
   ```bash
   npm install --force
   ```
   - **Time**: ~8-15 seconds normally, up to 5 minutes with network issues
   - **CRITICAL**: Use `--force` flag due to Hardhat toolbox version conflicts with newer Hardhat versions
   - **Alternative**: `npm install --legacy-peer-deps` (may not install all required dependencies)

2. **Compile smart contracts** (NEVER CANCEL - wait up to 3 minutes):
   ```bash
   npx hardhat compile
   ```
   - **Time**: ~1-2 seconds after dependencies are installed
   - **CRITICAL**: Compilation downloads Solidity 0.8.24 compiler on first run
   - **Set timeout to 3+ minutes** for initial compilation

3. **Run tests** (NEVER CANCEL - wait up to 3 minutes):
   ```bash
   npx hardhat test
   ```
   - **Time**: ~1-2 seconds 
   - **CRITICAL**: Tests validate deployment functionality and contract properties
   - **Set timeout to 3+ minutes** for comprehensive validation

### Deploy Contracts

1. **Deploy on local Hardhat network**:
   ```bash
   npx hardhat run scripts/deploy.js --network hardhat
   ```
   - **Time**: ~1-2 seconds
   - **Alternative script**: `npx hardhat run scripts/deploy-DE.js --network hardhat`

2. **Deploy to live networks** (requires environment variables):
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   npx hardhat run scripts/deploy.js --network mainnet
   npx hardhat run scripts/deploy.js --network polygon
   npx hardhat run scripts/deploy.js --network bsc
   ```
   - **Required env vars**: `PRIVATE_KEY`, `INFURA_API_KEY` (or network-specific RPC URLs)
   - **Time**: Variable depending on network congestion

### Development and Testing

1. **Start local blockchain node**:
   ```bash
   npx hardhat node
   ```
   - **Usage**: Runs local Ethereum node on http://127.0.0.1:8545
   - **Accounts**: Provides 20 test accounts with 10,000 ETH each
   - **CRITICAL**: Keep running in background for local development

2. **Interactive console**:
   ```bash
   npx hardhat console
   ```
   - **Usage**: Node.js REPL with Hardhat environment loaded
   - **Access**: Use `ethers`, `hre`, and deployed contracts

3. **Clean build artifacts**:
   ```bash
   npx hardhat clean
   ```
   - **Time**: ~1 second
   - **Usage**: Clears cache/ and artifacts/ directories

## Validation

### Manual Validation Scenarios

**ALWAYS test the following scenarios after making changes:**

1. **Basic deployment validation**:
   ```bash
   npx hardhat run scripts/deploy.js --network hardhat
   ```
   - **Expected output**: Two contract addresses and balance distribution (50,000 / 450,000 SEQ)
   - **Verify**: Owner gets 10% tokens, ICO contract gets 90% tokens

2. **Test suite validation**:
   ```bash
   npx hardhat test
   ```
   - **Expected**: 3 passing tests with no failures
   - **Tests cover**: Contract deployment, token distribution, and property settings

3. **Contract compilation validation**:
   ```bash
   npx hardhat compile
   ```
   - **Expected**: "Compiled 8 Solidity files successfully"
   - **No warnings or errors should appear**

### Before Committing Changes

**ALWAYS run these commands before committing:**

1. **Clean and recompile**:
   ```bash
   npx hardhat clean && npx hardhat compile
   ```

2. **Run full test suite**:
   ```bash
   npx hardhat test
   ```

3. **Test both deployment scripts**:
   ```bash
   npx hardhat run scripts/deploy.js --network hardhat
   npx hardhat run scripts/deploy-DE.js --network hardhat
   ```

## Common Issues and Solutions

### Dependency Issues
- **Problem**: "ERESOLVE could not resolve" errors during npm install
- **Solution**: Use `npm install --force` (recommended) or `npm install --legacy-peer-deps`
- **Problem**: "Plugin @nomicfoundation/hardhat-toolbox requires the following dependencies"
- **Solution**: Run `npm install --force` to install all required toolbox dependencies

### Compilation Issues  
- **Problem**: "require is not defined in ES module scope"
- **Solution**: Ensure hardhat.config.js uses `import` and `export default` (not `require`/`module.exports`)

### Node.js Version Warning
- **Warning**: "You are using Node.js 20.x which is not supported"
- **Impact**: Warning only - compilation and deployment work correctly
- **Recommendation**: Upgrade to Node.js 22.10.0+ for optimal support

## Repository Structure

```
├── contracts/
│   ├── SEQICO.sol          # Main ICO contract
│   └── SEQToken.sol        # ERC20 token contract
├── scripts/
│   ├── deploy.js           # Main deployment script
│   └── deploy-DE.js        # Alternative deployment script
├── test/
│   └── deployment.test.js  # Deployment validation tests
├── hardhat.config.js       # Hardhat configuration
└── package.json            # Dependencies and scripts
```

### Key Files

**Always check these files when making changes:**

- **contracts/SEQICO.sol**: Main ICO contract with buy functions for ETH/USDT/USDC
- **contracts/SEQToken.sol**: ERC20 token with 500,000 total supply
- **scripts/deploy.js**: Primary deployment script
- **hardhat.config.js**: Network configurations for sepolia, mainnet, polygon, bsc
- **test/deployment.test.js**: Validates contract deployment and token distribution

## Network Configurations

The project supports multiple networks with the following configuration:

- **hardhat**: Local development network
- **sepolia**: Ethereum testnet
- **mainnet**: Ethereum mainnet  
- **polygon**: Polygon mainnet
- **bsc**: Binance Smart Chain

**Environment variables required for live networks:**
- `PRIVATE_KEY`: Deployer wallet private key
- `INFURA_API_KEY`: Infura API key (for Ethereum networks)
- `ETHERSCAN_API_KEY`: For contract verification

## Contract Addresses Used

**The deployment scripts reference these token addresses:**
- **USDT Mainnet**: `0xdac17f958d2ee523a2206206994597c13d831ec7`
- **USDC Example**: `0x833589fcd6edb6e08f4c7c32d4f71b54bda02913`

**Update these addresses when deploying to different networks.**

## Timeout Recommendations

- **npm install**: 5+ minutes (set timeout to 300+ seconds)
- **npx hardhat compile**: 3+ minutes for first run (set timeout to 180+ seconds)  
- **npx hardhat test**: 3+ minutes (set timeout to 180+ seconds)
- **Deployment scripts**: 2+ minutes on live networks (set timeout to 120+ seconds)

**NEVER CANCEL long-running commands** - builds and tests may take several minutes, especially on first run.
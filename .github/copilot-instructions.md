# SEQICO Smart Contract Deployment

SEQICO is a Hardhat-based Ethereum smart contract project for deploying ICO (Initial Coin Offering) contracts that handle SEQ token sales with ETH, USDT, and USDC payments.

**ALWAYS follow these instructions first and only fallback to additional search and context gathering if the information here is incomplete or found to be in error.**

## Working Effectively

### Prerequisites and Setup
- **CRITICAL**: Use Node.js 18.x only. Node.js 20+ causes compatibility issues with Hardhat.
- Run `export PATH="/usr/bin:$PATH"` to ensure Node.js 18.x is used (system installation).
- Bootstrap the repository:
  - `npm install --legacy-peer-deps` -- takes 12 seconds. NEVER CANCEL.
  - `npx hardhat compile` -- takes 1 second for clean builds. NEVER CANCEL. Set timeout to 60+ seconds.

### Build and Test Commands
- **Compile contracts**: `npx hardhat compile` -- 1 second for incremental, ~1 second for clean builds
- **Run tests**: `npx hardhat test` -- takes 1.5 seconds. NEVER CANCEL. Set timeout to 30+ seconds.
- **Clean build**: `npx hardhat clean && npx hardhat compile` -- takes 1 second total
- **Deploy (local test)**: `npx hardhat run scripts/deploy.js --network hardhat` -- takes 1.5 seconds
- **Alternative deploy**: `npx hardhat run scripts/deploy-DE.js --network hardhat` -- takes 1.5 seconds

### **CRITICAL COMPATIBILITY REQUIREMENTS**
- **Node.js Version**: MUST use Node.js 18.x. Run `export PATH="/usr/bin:$PATH"` before any commands
- **Package Installation**: MUST use `npm install --legacy-peer-deps` due to peer dependency conflicts
- **Config File**: Uses `hardhat.config.cjs` (CommonJS) instead of `.js` due to ESM project setup
- **Import Syntax**: All scripts use `import pkg from "hardhat"; const { ethers } = pkg;` pattern

## Validation

### Manual Testing After Changes
- ALWAYS run the complete validation sequence after making changes:
  1. `export PATH="/usr/bin:$PATH"` (ensure correct Node.js version)
  2. `npm install --legacy-peer-deps` (if dependencies changed)
  3. `npx hardhat compile` (verify contracts compile)
  4. `npx hardhat test` (verify tests pass)
  5. `npx hardhat run scripts/deploy.js --network hardhat` (verify deployment works)

### **Contract Interaction Testing**
- The test suite demonstrates token purchase functionality with different amounts
- Tests validate ETH payment calculations and contract interactions
- Deploy script creates tokens with 10% to owner, 90% to ICO contract (500,000 total supply)

### **NEVER CANCEL Commands**
- `npm install --legacy-peer-deps` -- Set timeout to 60+ seconds
- `npx hardhat compile` -- Set timeout to 60+ seconds  
- `npx hardhat test` -- Set timeout to 30+ seconds
- All deployment scripts -- Set timeout to 30+ seconds

## Known Issues and Workarounds

### **Dependency Conflicts**
- Project requires `npm install --legacy-peer-deps` due to Hardhat toolbox version conflicts
- OpenZeppelin v5 requires explicit Ownable constructor parameters (fixed in contracts)
- ESM project setup requires special import syntax and .cjs config file

### **Node.js Compatibility**
- Hardhat warns about Node.js 18.x not being supported, but it works correctly
- Node.js 20+ causes runtime errors with Hardhat's dependency resolution
- Always use `export PATH="/usr/bin:$PATH"` to ensure system Node.js 18.x is used

### **No Linting Tools**
- Project does not include ESLint, Prettier, or other linting tools
- No additional formatting or style checking is available
- Follow existing code style patterns in the repository

## Project Structure

### **Key Contracts**
- `contracts/SEQICO.sol`: ICO contract for token sales (ETH, USDT, USDC payments)
- `contracts/SEQToken.sol`: ERC20 token with 500K supply (10% owner, 90% ICO)

### **Deployment Scripts**
- `scripts/deploy.js`: Main deployment script with specific addresses and pricing
- `scripts/deploy-DE.js`: Alternative deployment with same logic, different configuration
- Both scripts deploy ICO first, then token, then link them together

### **Testing**
- `test/SEQICO.test.js`: Comprehensive tests for contract functionality
- Tests demonstrate code review fixes and token purchase scenarios
- Validates different token amounts and payment calculations

### **Configuration**
- `hardhat.config.cjs`: Hardhat configuration (CommonJS format for ESM compatibility)
- `package.json`: Dependencies with specific version constraints
- `.github/workflows/ci-cd.yml`: CI/CD pipeline for build, test, and deployment

## Frequently Used Commands

```bash
# Setup (run once)
export PATH="/usr/bin:$PATH"
npm install --legacy-peer-deps

# Development workflow
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network hardhat

# Troubleshooting
npx hardhat clean
npx hardhat --help
npx hardhat console

# File structure overview
ls -la
find . -name "*.sol" -o -name "*.js" -o -name "*.cjs" | grep -v node_modules
```

## Contract Addresses and Configuration

### **Deployment Addresses (from scripts)**
- Owner: `0x4B958C04701616A0ffF821E9b2db130983c5f3E4`
- USDT: `0xdac17f958d2ee523a2206206994597c13d831ec7` (mainnet)
- USDC: `0x833589fcd6edb6e08f4c7c32d4f71b54bda02913` (example address)

### **Token Economics**
- Total supply: 500,000 SEQ tokens
- Distribution: 10% to owner (50K), 90% to ICO contract (450K)
- Pricing: 0.01 ETH per token, 10 USDT per token, 10 USDC per token

### **Contract Functions**
- `buyWithETH(uint256 tokenAmount)`: Purchase with ETH (includes refund for overpayment)
- `buyWithUSDT(uint256 tokenAmount)`: Purchase with USDT (requires prior approval)
- `buyWithUSDC(uint256 tokenAmount)`: Purchase with USDC (requires prior approval)
- `setSEQToken(address)`: Update token address (owner only)
- `withdrawETH(address)`: Withdraw collected ETH (owner only)
- `withdrawERC20(address, address)`: Withdraw ERC20 tokens (owner only)

## Complete Validation Test Script

Run this complete validation sequence to verify everything works:

```bash
# Complete validation test
export PATH="/usr/bin:$PATH"
echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"
npx hardhat clean
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network hardhat
npx hardhat run scripts/deploy-DE.js --network hardhat
echo "All validation tests completed successfully!"
```

**Expected Results:**
- Node.js v18.20.8, npm 10.8.2+
- Clean compile: "Compiled 8 Solidity files successfully"
- Tests: "2 passing" in ~600ms
- Deployment: Shows contract addresses and token balances (50K owner, 450K ICO)
- Both deployment scripts produce identical results

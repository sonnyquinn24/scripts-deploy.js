# SEQICO Smart Contract Deployment Project

SEQICO is a Hardhat-based Ethereum smart contract project for deploying an ICO (Initial Coin Offering) that allows purchasing SEQ tokens with ETH, USDT, and USDC. The project includes two smart contracts: SEQICO (ICO contract) and SEQToken (ERC20 token).

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Install Dependencies
```bash
# Install dependencies (REQUIRED: use legacy peer deps due to version conflicts)
npm install --legacy-peer-deps
```

**CRITICAL**: Always use `--legacy-peer-deps` flag when installing. Standard `npm install` will fail due to version conflicts between hardhat 3.0.3 and hardhat-toolbox 6.1.0.

### Network Limitations and Compilation Issues

**IMPORTANT**: This environment has network restrictions that prevent downloading the Solidity compiler from binaries.soliditylang.org. The following commands will FAIL:
- `npx hardhat compile` - Cannot download Solidity compiler
- `npx hardhat build` - Cannot download Solidity compiler  
- `npx hardhat run scripts/deploy.js` - Requires compilation first
- `npx hardhat test` - Requires compilation first

### Working Commands in Restricted Environment

```bash
# Start Hardhat local blockchain node (WORKS - takes 3-5 seconds)
npx hardhat node
# NEVER CANCEL: Node startup takes 3-5 seconds. Set timeout to 60+ seconds.

# Open Hardhat console without compilation (WORKS - immediate)
npx hardhat console --no-compile

# View available Hardhat commands (immediate)
npx hardhat --help

# List installed packages (immediate)
npm list

# Flatten contracts for analysis (WORKS - takes 2-3 seconds)
npx hardhat flatten contracts/SEQToken.sol
npx hardhat flatten contracts/SEQICO.sol
# NEVER CANCEL: Flatten takes 2-3 seconds. Set timeout to 30+ seconds.
```

### Working in Unrestricted Environment

In a normal development environment with internet access, these commands should work:

```bash
# Compile smart contracts (takes 30-60 seconds)
npx hardhat compile
# NEVER CANCEL: Compilation takes 30-60 seconds. Set timeout to 120+ seconds.

# Deploy contracts to local network
npx hardhat run scripts/deploy.js
npx hardhat run scripts/deploy-DE.js

# Deploy to specific network
npx hardhat run scripts/deploy.js --network localhost
```

### Node.js Version Warning
The project shows warnings about Node.js 20.19.4 not being supported. Hardhat recommends Node.js 22.10.0+ for optimal compatibility, but the project works with current version.

## Project Structure

### Smart Contracts (`/contracts/`)
- **SEQICO.sol**: Main ICO contract with functions:
  - `buyWithETH(uint256 tokenAmount)`: Purchase tokens with ETH
  - `buyWithUSDT(uint256 tokenAmount)`: Purchase tokens with USDT  
  - `buyWithUSDC(uint256 tokenAmount)`: Purchase tokens with USDC
  - `setSEQToken(address _seqToken)`: Update SEQ token address (owner only)
  - `withdrawETH(address payable recipient)`: Withdraw collected ETH (owner only)
  - `withdrawERC20(address token, address recipient)`: Withdraw ERC20 tokens (owner only)

- **SEQToken.sol**: Standard ERC20 token contract
  - Total supply: 500,000 SEQ tokens
  - Initial distribution: 10% to owner, 90% to ICO contract

### Deployment Scripts (`/scripts/`)
- **deploy.js**: Main deployment script with detailed comments
- **deploy-DE.js**: Alternative deployment script (virtually identical to deploy.js, only minor comment differences)

Both scripts perform the same deployment sequence:
1. Deploy SEQICO contract with dummy token address
2. Deploy SEQToken with 10% to owner, 90% to ICO
3. Update SEQICO with real SEQToken address
4. Print balances for verification

### Configuration
- **hardhat.config.js**: Basic Hardhat configuration specifying Solidity version 0.8.24
- **package.json**: Project dependencies including Hardhat 3.0.3, hardhat-toolbox 6.1.0, OpenZeppelin contracts 5.4.0

## Contract Analysis

### Working Contract Inspection Commands
Even without compilation, you can analyze the contract structure:

```bash
# View contract source code
cat contracts/SEQToken.sol
cat contracts/SEQICO.sol

# Flatten contracts to see all dependencies (works in restricted environment)
npx hardhat flatten contracts/SEQToken.sol > /tmp/SEQToken-flattened.sol
npx hardhat flatten contracts/SEQICO.sol > /tmp/SEQICO-flattened.sol

# Count lines of code in contracts
find contracts/ -name "*.sol" -exec wc -l {} \;

# Search for specific patterns in contracts
grep -n "function\|event\|modifier" contracts/*.sol
```

## Validation

### Manual Testing Scenarios
When network restrictions allow compilation and deployment:
1. **Deploy and verify contracts**: Run deployment script and check that both contracts deploy successfully
2. **Verify token distribution**: Confirm owner receives 10% and ICO contract receives 90% of tokens
3. **Test ICO functionality**: Verify buying tokens with ETH works correctly
4. **Test owner functions**: Verify only owner can call restricted functions

### Development Workflow
```bash
# Start local blockchain (always works - takes 3-5 seconds)
npx hardhat node

# In separate terminal, deploy contracts (requires unrestricted network)
npx hardhat run scripts/deploy.js --network localhost

# Interact with contracts via console
npx hardhat console --network localhost

# Analyze contract structure (works in restricted environment)
npx hardhat flatten contracts/SEQToken.sol
npx hardhat flatten contracts/SEQICO.sol
```

## Common Issues

### Dependency Installation
- **Problem**: `npm install` fails with ERESOLVE errors
- **Solution**: Always use `npm install --legacy-peer-deps`

### Compilation Failures  
- **Problem**: Cannot download Solidity compiler due to network restrictions
- **Solution**: No workaround available in restricted environments. Document this limitation and provide alternative testing approaches.

### No Test Suite
The project currently has no test suite (package.json shows placeholder test command that exits with error). If adding tests:
- Create test files in `/test/` directory
- Use Hardhat testing framework with Mocha/Chai
- Test both SEQICO and SEQToken functionality

## Repository Quick Reference

### Key Files Listing
```
.
├── README.md              # Project documentation
├── package.json           # Dependencies and scripts
├── hardhat.config.js      # Hardhat configuration
├── contracts/
│   ├── SEQICO.sol        # ICO smart contract
│   └── SEQToken.sol      # ERC20 token contract
└── scripts/
    ├── deploy.js         # Main deployment script
    └── deploy-DE.js      # Alternative deployment script
```

### Package.json Dependencies
```json
{
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^6.1.0",
    "@openzeppelin/contracts": "^5.4.0", 
    "hardhat": "^3.0.3"
  }
}
```

## Important Notes

- **NEVER CANCEL** long-running operations. Compilation and deployment can take 60+ seconds.
- Always use `--legacy-peer-deps` for npm operations.
- The two deployment scripts are functionally identical.
- Network restrictions prevent standard Hardhat compilation in some environments.
- No test suite exists - create tests if functionality changes are made.
- Use Hardhat console with `--no-compile` flag for immediate access without compilation.
# SEQICO Smart Contract Deployment Project

This is a Hardhat project for deploying SEQICO ICO smart contract and SEQ token contracts to Ethereum networks. The project contains smart contracts written in Solidity and deployment scripts.

**ALWAYS follow these instructions first and only fall back to additional search and context gathering if the information in these instructions is incomplete or found to be in error.**

## Working Effectively

### Prerequisites and Setup
- Install dependencies with dependency conflict resolution:
  ```bash
  npm install --legacy-peer-deps
  ```
  - Takes approximately 4 seconds to complete
  - **CRITICAL**: MUST use `--legacy-peer-deps` flag due to Hardhat version conflicts, or installation will fail

### Node.js Version Warning
- Current environment uses Node.js 20.19.4, but Hardhat recommends 22.10.0+ LTS versions
- This generates warnings but does not prevent basic operations
- All commands will show: "WARNING: You are using Node.js 20.19.4 which is not supported by Hardhat"

### Available Working Commands
Run these commands from the project root directory:

#### Information and Help Commands (< 1 second each)
- `npx hardhat` - Show available tasks and help
- `npx hardhat --version` - Show Hardhat version (3.0.3)
- `npx hardhat <TASK> --help` - Get help for specific tasks
- `npx hardhat clean` - Clear cache and artifacts directories

#### Contract Analysis Commands (< 1 second each)  
- `npx hardhat flatten contracts/SEQToken.sol` - Flatten SEQToken contract with dependencies
- `npx hardhat flatten contracts/SEQICO.sol` - Flatten SEQICO contract with dependencies
- The flatten command works and shows the complete contract code with all OpenZeppelin imports resolved

### Commands That DO NOT WORK (Network Restrictions)
**DO NOT attempt these commands as they will fail due to network restrictions preventing Solidity compiler downloads:**

- `npx hardhat compile` - FAILS: "Couldn't download compiler version list"
- `npx hardhat build` - FAILS: Same network restriction issue  
- `npx hardhat test` - FAILS: Requires compilation first
- `npx hardhat run scripts/deploy.js` - FAILS: Requires compilation first
- `npx hardhat run scripts/deploy-DE.js` - FAILS: Requires compilation first
- `npx hardhat node` - FAILS: Requires compilation first
- `npx hardhat console` - FAILS: Requires compilation first

**Always document any command that fails due to network restrictions rather than trying workarounds.**

## Project Structure and Key Files

### Repository Root
```
.
├── README.md              # Project documentation with setup instructions
├── LICENSE               # MIT License
├── package.json          # Dependencies: Hardhat 3.0.3, OpenZeppelin 5.4.0
├── package-lock.json     # Locked dependency versions
├── hardhat.config.js     # Basic Hardhat config (Solidity 0.8.24)
├── .gitignore           # Excludes node_modules, cache, artifacts
├── contracts/           # Smart contract source files
│   ├── SEQICO.sol      # Main ICO contract (ETH, USDT, USDC purchases)
│   └── SEQToken.sol    # ERC20 token contract (500k total supply)
├── scripts/            # Deployment scripts
│   ├── deploy.js       # Main deployment script
│   └── deploy-DE.js    # Alternative deployment script 
├── cache/              # Hardhat cache (created by operations)
└── node_modules/       # Dependencies (created by npm install)
```

### Contract Overview
- **SEQToken.sol**: Standard ERC20 token with 500,000 total supply (10% to owner, 90% to ICO)
- **SEQICO.sol**: ICO contract supporting purchases with ETH, USDT, and USDC
- Both deployment scripts are functionally identical with slightly different formatting

## Development Workflow

### When Making Code Changes
1. **ALWAYS** run `npm install --legacy-peer-deps` first if working with a fresh clone
2. Use `npx hardhat flatten contracts/<ContractName>.sol` to verify contract structure and imports
3. Review the flattened output to understand dependencies before making changes
4. **Cannot build or test due to network restrictions** - document this limitation
5. Manually review Solidity code for syntax and logic correctness
6. Use static analysis tools or IDE features for validation instead of compilation

### Contract Validation Scenarios  
Since compilation and testing are not available due to network restrictions:

1. **Manual Code Review**: 
   - Verify Solidity syntax matches version 0.8.24 specification
   - Check OpenZeppelin import paths are correct (`@openzeppelin/contracts/...`)
   - Validate contract inheritance and function signatures

2. **Flatten and Inspect**:
   - Always run `npx hardhat flatten` on modified contracts
   - Review the flattened output to ensure all dependencies resolve correctly
   - Verify no import errors or missing dependencies

3. **Static Analysis**:
   - Use IDE Solidity extensions for syntax checking
   - Manually verify gas optimization patterns
   - Check for common security vulnerabilities

### Common Issues and Solutions

1. **npm install fails**: 
   - ALWAYS use `npm install --legacy-peer-deps`
   - Never use `npm install` without the flag

2. **Compilation errors**:
   - Document as "DOES NOT WORK due to network restrictions" 
   - Do not attempt workarounds or alternative approaches
   - Use flatten command for contract verification instead

3. **Node.js version warnings**:
   - Expected behavior, document but continue with operations
   - Does not prevent basic file operations or flatten commands

## Key Configuration Details

### Package.json Dependencies
```json
{
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^6.1.0",
    "@openzeppelin/contracts": "^5.4.0", 
    "hardhat": "^3.0.3"
  },
  "type": "module"
}
```

### Hardhat Configuration (hardhat.config.js)
```javascript
export default {
  solidity: "0.8.24"
};
```

## Testing Strategy

**CRITICAL: No test framework is available due to compilation restrictions.**

### Alternative Validation Methods
1. **Code Review**: Manually verify contract logic and inheritance
2. **Flatten Command**: Use to validate imports and dependencies resolve
3. **Static Analysis**: Use IDE tools for syntax and basic error checking
4. **Documentation Review**: Cross-reference with OpenZeppelin documentation

### Expected Test Structure (if compilation were available)
- Unit tests would go in `test/` directory (currently does not exist)
- Would use Hardhat's built-in testing framework with Mocha/Chai
- Tests would cover ICO functionality, token distribution, and access controls

## Deployment Process (Cannot Execute Due to Network Restrictions)

The deployment scripts are configured but cannot be executed:

1. **scripts/deploy.js**: Main deployment script
   - Deploys SEQICO contract first with dummy token address
   - Deploys SEQToken contract with 10% to owner, 90% to ICO
   - Updates SEQICO with real token address
   - Prints balances for verification

2. **scripts/deploy-DE.js**: Alternative deployment script (functionally identical)

**Both scripts fail with compilation errors due to network restrictions.**

## Quick Reference Commands

### Working Commands
```bash
# Setup (REQUIRED)
npm install --legacy-peer-deps

# Information  
npx hardhat
npx hardhat --version

# Contract Analysis
npx hardhat flatten contracts/SEQToken.sol
npx hardhat flatten contracts/SEQICO.sol

# Cleanup
npx hardhat clean
```

### Non-Working Commands (Document as Failures)
```bash
# These WILL FAIL - do not attempt
npx hardhat compile
npx hardhat test  
npx hardhat run scripts/deploy.js
```

## Important Notes

- **NEVER CANCEL** any operation you attempt - let commands complete or fail naturally
- **ALWAYS** document network restriction failures rather than finding workarounds
- Use `--legacy-peer-deps` flag for ALL npm operations
- Focus on static code analysis rather than dynamic testing
- The flatten command is your primary tool for contract verification

This project requires a development environment with full network access and appropriate Node.js version to be fully functional. In restricted environments, limit work to code review, static analysis, and documentation updates.
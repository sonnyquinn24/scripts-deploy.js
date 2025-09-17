# GitHub Copilot Instructions for SEQICO Smart Contract Project

## Project Overview

This repository contains the SEQICO ICO smart contract deployment project, featuring:
- **SEQICO.sol**: Main ICO contract for token sales with ETH, USDT, and USDC
- **SEQToken.sol**: ERC20 token contract with configurable distribution
- **Deployment scripts**: Automated deployment with different configurations
- **Comprehensive test suite**: Mocha/Chai tests for contract validation

## Development Guidelines

### Code Style and Standards
- **Solidity**: Follow OpenZeppelin standards and use latest stable compiler (^0.8.24)
- **JavaScript**: Use ES6+ modules, async/await patterns, and ethers.js v6
- **Testing**: Write comprehensive tests for all contract functions and edge cases
- **Comments**: Document complex logic, especially mathematical calculations and security considerations

### Security Best Practices
- Use OpenZeppelin's battle-tested contracts (Ownable, ERC20, etc.)
- Implement proper access control with `onlyOwner` modifiers
- Validate all inputs and handle edge cases (zero amounts, invalid addresses)
- Follow checks-effects-interactions pattern to prevent reentrancy
- Use SafeMath patterns (built into Solidity 0.8+) for arithmetic operations

### Testing Patterns
- Test deployment and initial state validation
- Test access control and ownership functions
- Test token economics and distribution logic
- Test error conditions and edge cases
- Use descriptive test names and organize by functionality

## Automation Resources

### 🚀 Quick Setup
New developers should start here:

```bash
# Automated setup script - runs dependency installation and validation
npm run setup
# or directly: bash scripts/setup.sh
```

This script handles:
- Node.js version validation and warnings
- Dependency installation with `--legacy-peer-deps`
- Project structure verification
- Development environment reminders

### 🧪 Test Scaffold
Comprehensive test suite available in `/test/` directory:

- **`test/SEQToken.test.js`**: ERC20 token contract tests
  - Deployment validation and initial distribution
  - Balance operations and transfer functionality
  - Access control and ownership management
  - ERC20 compliance and event emission

- **`test/SEQICO.test.js`**: ICO contract tests
  - Deployment with correct parameters
  - ETH purchase functionality and price calculations
  - Access control for administrative functions
  - Error handling and edge cases

### 📚 Onboarding Documentation
Complete developer onboarding guide: **`docs/ONBOARDING.md`**

Includes:
- ✅ Environment setup checklist
- 🛠️ Essential commands reference
- 📁 Project structure overview
- 🔧 Development workflow guide
- 🛟 Troubleshooting common issues
- 📚 Additional learning resources

### 🔄 CI/CD Pipeline
GitHub Actions workflow: **`.github/workflows/lint.yml`**

Automated checks on pull requests:
- Smart contract compilation with Hardhat
- Solidity static analysis with Solhint
- Security pattern detection
- Test file syntax validation
- Multi-version Node.js compatibility testing

## Development Workflow

### Starting Development
1. **Run setup**: `npm run setup` - automated environment preparation
2. **Read docs**: Check `docs/ONBOARDING.md` for detailed guidance
3. **Review tests**: Understand existing test patterns in `/test/`
4. **Explore contracts**: Study the smart contract architecture

### Making Changes
1. **Branch**: Create feature branches from main
2. **Test**: Run `npm test` to ensure existing functionality works
3. **Compile**: Use `npx hardhat compile` to validate Solidity code
4. **Document**: Update relevant documentation for significant changes

### Code Suggestions

When suggesting code:

#### For Smart Contracts
- Prefer OpenZeppelin imports over custom implementations
- Use explicit variable names for calculations (avoid magic numbers)
- Include NatSpec documentation for public functions
- Consider gas optimization for frequently called functions

Example:
```solidity
// Good: Clear variable names and proper validation
function buyWithETH(uint256 tokenAmount) external payable {
    require(tokenAmount > 0, "Token amount must be greater than zero");
    
    uint256 requiredETH = (tokenAmount * pricePerTokenETH) / 1e18;
    require(msg.value >= requiredETH, "Insufficient ETH sent");
    
    // Implementation...
}
```

#### For Tests
- Group related tests using `describe` blocks
- Use descriptive test names that explain the expected behavior
- Test both success and failure scenarios
- Use proper Chai assertions for clear error messages

Example:
```javascript
describe("Access Control", function () {
  it("Should allow only owner to set token price", async function () {
    await expect(seqico.connect(owner).setPriceETH(newPrice))
      .to.not.be.reverted;
      
    await expect(seqico.connect(user).setPriceETH(newPrice))
      .to.be.revertedWithCustomError(seqico, "OwnableUnauthorizedAccount");
  });
});
```

#### For Scripts
- Use async/await for better readability
- Include error handling and validation
- Add console output for deployment tracking
- Document configuration parameters

### Common Tasks and Solutions

#### Adding New Contract Functions
1. Update the contract with proper access control
2. Add comprehensive tests for the new functionality
3. Update deployment scripts if needed
4. Document the new function in README.md

#### Fixing Test Issues
1. Check contract compilation: `npx hardhat compile`
2. Verify test syntax: `node -c test/filename.test.js`
3. Run individual test: `npx hardhat test test/specific.test.js`
4. Clear cache if needed: `npx hardhat clean`

#### Deployment Issues
1. Verify network configuration in `hardhat.config.js`
2. Check account balance for gas fees
3. Validate contract constructor parameters
4. Test deployment on local network first

## Project-Specific Context

### Token Economics
- **Total Supply**: 500,000 SEQ tokens
- **Distribution**: 10% to owner, 90% to ICO contract
- **Pricing**: Configurable for ETH, USDT, and USDC payments
- **Decimals**: 18 (standard ERC20)

### Contract Architecture
- **SEQICO**: Main ICO contract with purchase functions
- **SEQToken**: Standard ERC20 with initial distribution logic
- **Deployment**: Two-step process (ICO first, then token with ICO address)

### Key Files to Reference
- **Main README**: Project overview and setup instructions
- **Contract docs**: Inline comments in Solidity files
- **Test examples**: Existing patterns in test files
- **Deploy scripts**: Reference implementations in scripts/

## Remember
- Always prioritize security and proper testing
- Use the automation resources (setup script, tests, docs) when helping developers
- Reference existing patterns and maintain consistency
- Keep gas costs in mind for smart contract suggestions
- Encourage use of the onboarding documentation for new contributors

---

*These instructions help GitHub Copilot provide better, more contextual assistance for the SEQICO project. Always follow security best practices and encourage proper testing.*
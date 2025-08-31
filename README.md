# SEQICO Smart Contract Deployment

A Hardhat project for deploying the SEQICO ICO smart contract and SEQ token.

## Overview

This project contains:
- **SEQICO.sol**: The main ICO contract allowing token purchases with ETH, USDT, and USDC
- **SEQToken.sol**: The ERC20 token contract
- **Deployment scripts**: Two deployment scripts with different configurations

## Features

### SEQICO Contract
- Buy SEQ tokens with ETH, USDT, or USDC
- **$3 minimum price validation** for all payment methods
- Configurable pricing for each payment method with owner-only access
- Owner-only functions for token management and fund withdrawal
- Automatic ETH refunds for overpayments
- Event logging for all purchases

#### Price Validation
- **Minimum price constants**: $3 USD equivalent for all currencies
- **Strict enforcement**: Prevents setting prices below minimum thresholds
- **Owner-only access**: Only contract owner can modify prices
- **Comprehensive testing**: Full test suite validates all edge cases

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

4. Run tests:
```bash
# Run the comprehensive test suite
npm test

# Run specific test categories
npx hardhat test --grep "Price Setting Functions"
```

5. Verify and debug deployment:
```bash
# Verify price validation (set SEQICO_ADDRESS to your deployed contract)
SEQICO_ADDRESS=0x... npx hardhat run scripts/verify-price-validation.js

# Debug transactions if needed
SEQICO_ADDRESS=0x... TX_HASH=0x... npx hardhat run scripts/debug-transactions.js
```

## Contract Functions

### SEQICO Contract
- `buyWithETH(uint256 tokenAmount)`: Purchase tokens with ETH
- `buyWithUSDT(uint256 tokenAmount)`: Purchase tokens with USDT
- `buyWithUSDC(uint256 tokenAmount)`: Purchase tokens with USDC
- `setSEQToken(address _seqToken)`: Update SEQ token address (owner only)
- `setPricePerTokenETH(uint256 _pricePerTokenETH)`: Set ETH price per token (owner only, ≥$3)
- `setPricePerTokenUSDT(uint256 _pricePerTokenUSDT)`: Set USDT price per token (owner only, ≥$3)
- `setPricePerTokenUSDC(uint256 _pricePerTokenUSDC)`: Set USDC price per token (owner only, ≥$3)
- `withdrawETH(address payable recipient)`: Withdraw collected ETH (owner only)
- `withdrawERC20(address token, address recipient)`: Withdraw ERC20 tokens (owner only)

### Price Validation Constants
- `MIN_PRICE_USD`: 3,000,000 (represents $3.00 with 6 decimals)
- `MIN_PRICE_ETH`: 0.001 ETH (conservative minimum ~$3 when ETH > $3000)

## Testing and Debugging

### Automated Test Suite
The project includes comprehensive tests covering:
- ✅ $3 minimum price validation for all currencies
- ✅ Owner-only access control for price setting functions
- ✅ Purchase function validation with all payment methods
- ✅ Edge cases and error conditions
- ✅ Contract deployment validation

### Debugging Tools
- **Price Verification Script**: `scripts/verify-price-validation.js`
- **Transaction Debugger**: `scripts/debug-transactions.js`
- **Comprehensive Documentation**: `docs/TESTING_AND_DEBUGGING.md`

### Usage Examples
```bash
# Run all tests
npm test

# Verify deployed contract
SEQICO_ADDRESS=0x123... npx hardhat run scripts/verify-price-validation.js

# Debug a failed transaction
SEQICO_ADDRESS=0x123... TX_HASH=0xabc... npx hardhat run scripts/debug-transactions.js
```

## Configuration

The deployment scripts include configurable parameters:
- Owner address
- USDT/USDC contract addresses
- Token pricing for ETH, USDT, and USDC
- Total supply (500,000 SEQ tokens)

## License

MIT

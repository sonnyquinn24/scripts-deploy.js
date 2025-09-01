# SEQICO Smart Contract Testing and Debugging Guide

This document provides comprehensive guidance on testing and debugging the SEQICO smart contract, specifically focusing on the $3 minimum price validation feature.

## Overview

The SEQICO contract implements strict $3 minimum price validation for all supported payment methods (ETH, USDT, USDC). This ensures that token prices never fall below a reasonable threshold, protecting both the project and investors.

## Key Features

### 1. Minimum Price Constants
- `MIN_PRICE_USD`: 3,000,000 (represents $3.00 with 6 decimals for USDT/USDC)
- `MIN_PRICE_ETH`: 0.001 ETH (conservative minimum representing ~$3 when ETH > $3000)

### 2. Price Setting Functions
All price setting functions enforce the $3 minimum:
- `setPricePerTokenETH(uint256 _pricePerTokenETH)`
- `setPricePerTokenUSDT(uint256 _pricePerTokenUSDT)`
- `setPricePerTokenUSDC(uint256 _pricePerTokenUSDC)`

### 3. Owner-Only Access Control
Price setting functions can only be called by the contract owner, enforced by OpenZeppelin's `onlyOwner` modifier.

## Testing

### Running the Test Suite

```bash
# Run all tests
npm test

# Run specific test groups
npx hardhat test --grep "Price Setting Functions"
npx hardhat test --grep "Deployment"
npx hardhat test --grep "Edge Cases"
```

### Test Coverage

The test suite covers:

1. **Deployment Validation**
   - ✅ Valid prices above $3 minimum
   - ❌ Rejection of prices below minimum for each currency

2. **Price Setting Functions**
   - ✅ Owner can set valid prices
   - ❌ Non-owner cannot set prices (access control)
   - ❌ Prices below minimum are rejected
   - ✅ Prices exactly at minimum are accepted

3. **Purchase Functions**
   - ✅ Valid purchases with all payment methods
   - ✅ Price validation is enforced during purchases

4. **Edge Cases**
   - ✅ Exactly $3 minimum prices
   - ❌ One wei below minimum
   - ✅ Very large prices without overflow

5. **Constants Validation**
   - ✅ Correct minimum price constants
   - ✅ Constants remain unchanged throughout contract lifecycle

### Understanding Test Results

- ✅ **Green/Passing**: Feature works correctly
- ❌ **Red/Failing**: Issue detected - investigate immediately
- ⚠️ **Warning**: Unexpected behavior - review implementation

## Debugging Tools

### 1. Price Validation Verification Script

Verify correct implementation of price-setting functions:

```bash
# Set contract address and run verification
SEQICO_ADDRESS=0x... npx hardhat run scripts/verify-price-validation.js
```

**What it checks:**
- Current price settings vs. minimums
- Price setting function access controls
- Validation of edge cases
- Gas usage estimates

### 2. Transaction Debugger

Analyze failed transactions and common errors:

```bash
# Analyze specific transaction
SEQICO_ADDRESS=0x... TX_HASH=0x... npx hardhat run scripts/debug-transactions.js

# Simulate common error scenarios
SEQICO_ADDRESS=0x... npx hardhat run scripts/debug-transactions.js

# Generate debug report
SEQICO_ADDRESS=0x... npx hardhat run scripts/debug-transactions.js --report
```

**Features:**
- Transaction failure analysis
- Revert reason extraction
- Common error simulation
- Purchase calculation validation

## Common Error Messages and Solutions

### 1. "Price must be greater than or equal to $3"

**Cause**: Attempting to set a price below the minimum threshold.

**Solutions:**
- For ETH: Ensure price ≥ 0.001 ETH
- For USDT/USDC: Ensure price ≥ 3,000,000 (6 decimals)

**Example Fix:**
```javascript
// ❌ Wrong - below minimum
await seqico.setPricePerTokenETH(ethers.parseEther("0.0001"));

// ✅ Correct - above minimum
await seqico.setPricePerTokenETH(ethers.parseEther("0.01"));
```

### 2. "Ownable: caller is not the owner"

**Cause**: Non-owner attempting to call price setting functions.

**Solutions:**
- Use the owner's private key/account
- Transfer ownership if needed
- Verify correct contract address

### 3. "Insufficient ETH sent"

**Cause**: Buyer didn't send enough ETH for the requested tokens.

**Calculation Check:**
```javascript
const tokenAmount = ethers.parseEther("1"); // 1 SEQ token
const pricePerToken = await seqico.pricePerTokenETH(); // e.g., 0.01 ETH
const requiredETH = pricePerToken * tokenAmount / ethers.parseEther("1");
```

### 4. "Not enough SEQ tokens"

**Cause**: ICO contract doesn't have sufficient token balance.

**Solutions:**
- Transfer more SEQ tokens to the ICO contract
- Check token allocation in deployment

## Debugging Workflow

### Step 1: Identify the Problem

1. **Review transaction hash** if available
2. **Check error message** for specific issue type
3. **Verify contract state** using verification script

### Step 2: Analyze Root Cause

```bash
# Run diagnostic checks
SEQICO_ADDRESS=0x... npx hardhat run scripts/verify-price-validation.js

# If transaction hash available
SEQICO_ADDRESS=0x... TX_HASH=0x... npx hardhat run scripts/debug-transactions.js
```

### Step 3: Test Fix

1. **Create test case** reproducing the issue
2. **Implement fix** in contract or calling code
3. **Run full test suite** to ensure no regressions

```bash
npm test
```

### Step 4: Deploy and Verify

1. **Deploy updated contract** if needed
2. **Run verification script** on new deployment
3. **Monitor first transactions** for correct behavior

## Best Practices

### For Developers

1. **Always test price validation** before deployment
2. **Use verification script** after each deployment
3. **Monitor transaction failures** and investigate immediately
4. **Keep minimum price constants** reasonable but protective

### For Users/Integration

1. **Check current prices** before attempting purchases
2. **Calculate required payments** correctly based on token decimals
3. **Include sufficient gas** for transactions
4. **Handle revert messages** gracefully in UI

### For Monitoring

1. **Set up alerts** for failed transactions
2. **Regular health checks** using verification script
3. **Monitor price changes** for reasonableness
4. **Track gas usage** patterns

## Automated Testing in CI/CD

Add these commands to your CI/CD pipeline:

```bash
# Compile contracts
npm run compile

# Run full test suite
npm test

# Verify deployment (after deployment)
SEQICO_ADDRESS=$DEPLOYED_ADDRESS npx hardhat run scripts/verify-price-validation.js
```

## Troubleshooting Checklist

- [ ] Contract compiled successfully
- [ ] All tests passing
- [ ] Correct network configuration
- [ ] Valid contract address
- [ ] Owner account has sufficient gas
- [ ] Price values use correct decimals
- [ ] Token balances sufficient for operations

## Support and Further Help

For additional support:

1. **Review test cases** in `test/SEQICO.test.js`
2. **Check verification output** from debugging scripts
3. **Examine recent transactions** on block explorer
4. **Verify contract source code** on Etherscan

---

*This guide covers the essential aspects of testing and debugging the SEQICO contract's price validation system. Keep this document updated as the contract evolves.*
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
- **Price validation**: Enforces minimum $3 USD price for USDT and USDC purchases
- Configurable pricing for each payment method with owner-only price updates
- Owner-only functions for token management and fund withdrawal
- Automatic ETH refunds for overpayments
- Event logging for all purchases and price updates

### Price Validation Rules
- **Minimum Price Requirement**: All USDT and USDC prices must be at least $3.00 USD equivalent
- **Constructor Validation**: Prices are validated during contract deployment
- **Runtime Validation**: Price updates are validated when called by the owner
- **ETH Pricing**: ETH prices are not subject to USD validation (due to volatility)
- **Events**: Price updates emit `PriceUpdated` events for transparency

### SEQToken Contract
- Standard ERC20 token with ES module compatibility
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
npm run deploy

# Deploy with alternative script  
npm run deploy-de
```

4. Run tests:
```bash
npm test
```

## Testing

The project includes comprehensive unit tests for:
- **Price validation**: Ensures $3 minimum price enforcement
- **Access control**: Verifies owner-only functions
- **Token purchases**: Tests buying with ETH, USDT, and USDC
- **Price updates**: Tests price modification with validation
- **Event emissions**: Verifies proper event logging

### Test Coverage
- Constructor validation with invalid prices
- Price update validation with minimum requirements
- Token purchase calculations and transfers
- Access control for administrative functions
- Event emission verification

## Contract Functions

### SEQICO Contract
- `buyWithETH(uint256 tokenAmount)`: Purchase tokens with ETH
- `buyWithUSDT(uint256 tokenAmount)`: Purchase tokens with USDT (minimum $3 price enforced)
- `buyWithUSDC(uint256 tokenAmount)`: Purchase tokens with USDC (minimum $3 price enforced)
- `setSEQToken(address _seqToken)`: Update SEQ token address (owner only)
- `updatePriceETH(uint256 _pricePerTokenETH)`: Update ETH price (owner only)
- `updatePriceUSDT(uint256 _pricePerTokenUSDT)`: Update USDT price with $3 minimum validation (owner only)
- `updatePriceUSDC(uint256 _pricePerTokenUSDC)`: Update USDC price with $3 minimum validation (owner only)
- `withdrawETH(address payable recipient)`: Withdraw collected ETH (owner only)
- `withdrawERC20(address token, address recipient)`: Withdraw ERC20 tokens (owner only)

### Price Validation Constants
- `MINIMUM_USD_PRICE`: 3,000,000 (represents $3.00 USD with 6 decimal places)

### Events
- `TokensPurchased(address indexed buyer, uint256 amount, string payment)`: Emitted on token purchases
- `PriceUpdated(string currency, uint256 newPrice)`: Emitted when prices are updated

## Configuration

The deployment scripts include configurable parameters:
- Owner address
- USDT/USDC contract addresses  
- Token pricing for ETH, USDT, and USDC
- Total supply (500,000 SEQ tokens)

### Price Configuration Notes
- **USDT/USDC prices**: Must be at least $3.00 USD (3,000,000 with 6 decimals)
- **ETH prices**: No minimum validation due to volatility
- **Default prices**: Set to $3.00 minimum for USDT/USDC, 0.001 ETH for ETH

### Network Configuration
The project supports multiple networks via hardhat.config.js:
- **Local**: Hardhat network and localhost
- **Testnet**: Sepolia
- **Mainnet**: Ethereum mainnet, Base, Arbitrum

### CI/CD Configuration
- Automated testing and deployment via GitHub Actions
- Branch protection rules for main branch
- Security scanning with Slither
- Multi-environment deployment (testnet → mainnet)
- Proper secrets management for private keys and API keys

## License

MIT

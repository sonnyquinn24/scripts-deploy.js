# SEQICO Smart Contract Deployment

A Hardhat project for deploying the SEQICO ICO smart contract and SEQ token.

## Overview

This project contains:
- **SEQICO.sol**: The main ICO contract allowing token purchases with ETH, USDT, and USDC
- **SEQToken.sol**: The ERC20 token contract
- **Deployment scripts**: Two deployment scripts with different configurations
- **Automated Security Scanning**: Integrated SARIF-based security scanning workflow

## Features

### SEQICO Contract
- Buy SEQ tokens with ETH, USDT, or USDC
- Configurable pricing for each payment method with **minimum price validation**
- Owner-only functions for token management and fund withdrawal
- Automatic ETH refunds for overpayments
- Event logging for all purchases
- **Price validation**: Minimum price requirements enforced:
  - ETH: minimum 3 ether (3 × 10¹⁸ wei)
  - USDT: minimum 3,000,000 units (equivalent to $3 with 6 decimals)
  - USDC: minimum 3,000,000 units (equivalent to $3 with 6 decimals)

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

## Contract Functions

### SEQICO Contract
- `buyWithETH(uint256 tokenAmount)`: Purchase tokens with ETH
- `buyWithUSDT(uint256 tokenAmount)`: Purchase tokens with USDT
- `buyWithUSDC(uint256 tokenAmount)`: Purchase tokens with USDC
- `setPricePerTokenETH(uint256 _pricePerTokenETH)`: Set ETH price per token (owner only, ≥ 3 ETH)
- `setPricePerTokenUSDT(uint256 _pricePerTokenUSDT)`: Set USDT price per token (owner only, ≥ 3,000,000)
- `setPricePerTokenUSDC(uint256 _pricePerTokenUSDC)`: Set USDC price per token (owner only, ≥ 3,000,000)
- `setSEQToken(address _seqToken)`: Update SEQ token address (owner only)
- `withdrawETH(address payable recipient)`: Withdraw collected ETH (owner only)
- `withdrawERC20(address token, address recipient)`: Withdraw ERC20 tokens (owner only)

## Price Validation Policy

**Note**: When deploying, ensure all price parameters meet the minimum validation requirements, or the deployment will fail.

## Security Scanning & SARIF Automation

This repository includes a comprehensive automated security scanning workflow that generates and uploads SARIF (Static Analysis Results Interchange Format) files for code scanning results.

### Automated Workflows

#### 1. CodeQL Analysis (`.github/workflows/codeql-analysis.yml`)
- **Triggers**: Push to main, pull requests, manual dispatch
- **Languages**: Java, Python, JavaScript  
- **Output**: SARIF files in `sarif-output/codeql/`
- **Unique IDs**: Each scan generates files with unique automation IDs like `codeql-java-YYYYMMDD-HHMMSS`

#### 2. APIsec Security Scan (`.github/workflows/apisec-scan.yml`)
- **Triggers**: Push to main, pull requests, weekly schedule (Sunday 2:00 AM UTC), manual dispatch
- **Target**: VAmPI project
- **Output**: SARIF files in `sarif-output/apisec/`
- **Unique IDs**: Files tagged with `apisec-vampi-YYYYMMDD-HHMMSS`

#### 3. Automated SARIF Upload (`.github/workflows/sarif-upload.yml`)
- **Triggers**: Push to main, daily schedule (6:00 AM UTC), manual dispatch
- **Function**: Discovers and uploads all SARIF files from `sarif-output/` directory
- **Features**:
  - Automatic detection of SARIF files
  - Unique `runAutomationDetails.id` assignment
  - Categorized uploads for different scan types
  - Comprehensive summary reporting

### SARIF File Management

#### Directory Structure
```
sarif-output/
├── README.md           # Documentation
├── codeql/            # CodeQL analysis results
├── apisec/            # APIsec scan results
└── other/             # Additional security scan results
```

#### File Naming Convention
SARIF files follow the pattern: `{tool}-{category}-{timestamp}.sarif`

Examples:
- `codeql-java-20240101-120000.sarif`
- `apisec-vampi-20240101-120000.sarif`

#### Management Script
Use the included management script for SARIF file operations:

```bash
# List all SARIF files
./scripts/manage-sarif.sh list

# Generate sample SARIF files for testing
./scripts/manage-sarif.sh generate-sample

# Validate SARIF file format
./scripts/manage-sarif.sh validate sarif-output/codeql/file.sarif

# Clean old SARIF files (keeps last 10 per category)
./scripts/manage-sarif.sh clean

# Show help
./scripts/manage-sarif.sh help
```

### Key Features

#### Unique Automation IDs
Each SARIF file includes a unique `runAutomationDetails.id` to ensure proper categorization in GitHub's Security dashboard:
- CodeQL Java: `codeql-java-{timestamp}`
- CodeQL Python: `codeql-python-{timestamp}`
- APIsec: `apisec-vampi-{timestamp}`

#### Scheduled Automation
- **CodeQL**: Runs on every push and PR
- **APIsec**: Weekly scans on Sundays
- **SARIF Upload**: Daily consolidation at 6:00 AM UTC

#### Error Handling
- Workflows continue on individual scan failures
- SARIF files are archived as artifacts for debugging
- Comprehensive logging and summary reports

### Viewing Results

Security scan results appear in:
1. **GitHub Security Tab** → **Code Scanning**
2. **Actions Tab** → Individual workflow runs
3. **Artifacts** → Downloaded SARIF files for offline analysis

### Troubleshooting

#### Common Issues

1. **SARIF Upload Failures**
   - Check SARIF file format with validation script
   - Verify unique automation IDs are present
   - Review workflow logs for detailed error messages

2. **Missing SARIF Files**
   - Ensure scanners completed successfully
   - Check if files were generated in correct directories
   - Verify file permissions and accessibility

3. **Duplicate Scan Results**
   - Confirm unique automation IDs are being generated
   - Check for timestamp collisions in parallel runs
   - Review categorization logic in workflows

#### Manual Operations

To manually trigger workflows:
1. Go to **Actions** tab in GitHub
2. Select desired workflow
3. Click **Run workflow** button
4. Choose branch and options

### Maintenance

#### Retention Policy
- SARIF files are automatically cleaned by the management script
- Workflow artifacts are retained for 30 days
- Only the latest 10 files per category are kept locally

#### Updates
When updating scanning tools or adding new scanners:
1. Update the relevant workflow file
2. Add new category directory in `sarif-output/`
3. Update this documentation
4. Test with sample SARIF files

## Configuration

The deployment scripts include configurable parameters:
- Owner address
- USDT/USDC contract addresses
- Token pricing for ETH, USDT, and USDC (must meet minimum validation requirements)
- Total supply (500,000 SEQ tokens)

**Note**: When deploying, ensure all price parameters meet the minimum validation requirements, or the deployment will fail.

## License

MIT

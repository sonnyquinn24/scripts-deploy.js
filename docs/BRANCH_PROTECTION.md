# GitHub Actions Branch Protection Workflow

This repository includes a comprehensive GitHub Actions workflow that enforces branch protection rules for the `main` branch. The workflow automatically runs quality checks on all pull requests to ensure code quality and security.

## Workflow Overview

The workflow (`.github/workflows/branch-protection.yml`) includes four parallel jobs:

### 1. Code Linting (`lint`)
- **ESLint**: Checks JavaScript code for style and potential issues
- **Solhint**: Analyzes Solidity contracts for best practices and security
- Automatically creates configuration files if they don't exist
- Provides detailed feedback on code quality issues

### 2. Unit Testing (`test`)
- Runs comprehensive test suite using Mocha and Chai
- Validates repository structure and file existence
- Tests deployment script syntax and validity
- Automatically creates basic tests if none exist
- Ensures all tests pass before allowing merges

### 3. Security Checks (`security`)
- **npm audit**: Scans dependencies for known vulnerabilities
- **Secret scanning**: Checks for hardcoded secrets or sensitive information
- Provides security recommendations and warnings

### 4. Build Verification (`build`)
- Attempts to compile smart contracts using Hardhat
- Validates deployment script syntax
- Ensures the project can be built successfully

## Triggering the Workflow

The workflow automatically runs when:
- A pull request is opened targeting the `main` branch
- New commits are pushed to an existing pull request
- A pull request is marked as ready for review
- A pull request is reopened

## Status Checks

All four jobs must pass for the pull request to be mergeable:
- ✅ `lint` - Code quality checks
- ✅ `test` - Unit tests 
- ✅ `security` - Security scans
- ✅ `build` - Build verification

## Repository Configuration

To complete the branch protection setup, repository administrators should:

1. Go to **Settings** > **Branches**
2. Click **Add rule** for the `main` branch
3. Enable these options:
   - ✅ **Require status checks to pass before merging**
   - ✅ Select all status checks: `lint`, `test`, `security`, `build`
   - ✅ **Require review from code owners**
   - ✅ **Restrict pushes that create files**
   - ✅ **Restrict who can push to matching branches**

## Local Development

To run the same checks locally before submitting a pull request:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run JavaScript linting
npm run lint

# Run Solidity linting
npm run lint:sol

# Try to compile contracts
npm run compile
```

## Customization

The workflow can be customized by:
- Modifying `.github/workflows/branch-protection.yml`
- Updating ESLint rules in `eslint.config.js`
- Changing Solhint rules in `.solhint.json`
- Adding more tests in the `test/` directory
- Updating package.json scripts

## Benefits

This automated workflow provides:
- **Consistent code quality** across all contributions
- **Early detection** of bugs and security issues  
- **Automated feedback** to help developers improve their code
- **Protection** of the main branch from problematic changes
- **Documentation** of all quality checks and requirements

The workflow is designed to be helpful rather than obstructive, providing clear error messages and guidance when issues are found.
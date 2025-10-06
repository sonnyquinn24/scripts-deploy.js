#!/bin/bash

# SEQICO Smart Contract Project Setup Script
# This script sets up the development environment for the SEQICO project

set -e

echo "🚀 SEQICO Smart Contract Project Setup"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check Node.js version
echo ""
print_info "Checking Node.js version..."
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")

if [[ "$NODE_VERSION" == "not found" ]]; then
    print_error "Node.js is not installed. Please install Node.js 18+ or 20+"
    exit 1
fi

MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | tr -d 'v')

if [[ $MAJOR_VERSION -lt 18 ]]; then
    print_warning "Node.js version $NODE_VERSION detected. Recommended: v18+ or v20+"
    print_warning "Some features may not work correctly with older versions"
elif [[ $MAJOR_VERSION -eq 20 ]] && [[ $NODE_VERSION > "v20.10.0" ]]; then
    print_status "Node.js version $NODE_VERSION - Compatible"
elif [[ $MAJOR_VERSION -ge 18 ]]; then
    print_status "Node.js version $NODE_VERSION - Compatible"
else
    print_warning "Node.js version $NODE_VERSION may have compatibility issues"
fi

# Check npm version
print_info "Checking npm version..."
NPM_VERSION=$(npm --version 2>/dev/null || echo "not found")
if [[ "$NPM_VERSION" != "not found" ]]; then
    print_status "npm version $NPM_VERSION"
else
    print_error "npm not found"
    exit 1
fi

# Install dependencies
echo ""
print_info "Installing project dependencies..."
print_warning "Using --legacy-peer-deps to resolve dependency conflicts"

if npm install --legacy-peer-deps; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Verify Hardhat installation
echo ""
print_info "Verifying Hardhat installation..."
if npx hardhat --version > /dev/null 2>&1; then
    HARDHAT_VERSION=$(npx hardhat --version 2>/dev/null)
    print_status "Hardhat installed: $HARDHAT_VERSION"
else
    print_error "Hardhat verification failed"
    exit 1
fi

# Try to compile contracts (if possible)
echo ""
print_info "Attempting to compile smart contracts..."
if npx hardhat compile > /dev/null 2>&1; then
    print_status "Smart contracts compiled successfully"
else
    print_warning "Contract compilation failed (this may be due to network issues)"
    print_info "You can try running 'npx hardhat compile' manually later"
fi

# Display project structure
echo ""
print_info "Project structure overview:"
echo "  📁 contracts/     - Solidity smart contracts (SEQICO.sol, SEQToken.sol)"
echo "  📁 scripts/       - Deployment and utility scripts"
echo "  📁 test/          - Test files using Mocha and Chai"
echo "  📁 docs/          - Documentation and onboarding guides"
echo "  📄 hardhat.config.js - Hardhat configuration"
echo "  📄 package.json   - Project dependencies and scripts"

# Setup reminders
echo ""
print_info "📋 SETUP REMINDERS & REQUIREMENTS:"
echo ""
echo "1. 🔧 ENVIRONMENT SETUP:"
echo "   • Ensure you have Node.js 18+ or 20+ installed"
echo "   • Make sure npm is updated to the latest version"
echo "   • Consider using a Node version manager (nvm, fnm, volta)"
echo ""
echo "2. 📡 NETWORK CONFIGURATION:"
echo "   • Update hardhat.config.js with your network settings"
echo "   • Add your private keys to environment variables (never commit them!)"
echo "   • Configure RPC URLs for mainnet, testnet deployments"
echo ""
echo "3. 🔐 SECURITY CONSIDERATIONS:"
echo "   • Never commit private keys or sensitive data"
echo "   • Use .env files for environment variables (already in .gitignore)"
echo "   • Audit contracts before mainnet deployment"
echo ""
echo "4. 🧪 TESTING:"
echo "   • Run tests with: npm test"
echo "   • Add tests for any new functionality"
echo "   • Maintain good test coverage"
echo ""
echo "5. 📚 DOCUMENTATION:"
echo "   • Read docs/ONBOARDING.md for detailed setup instructions"
echo "   • Check .github/copilot-instructions.md for development guidelines"
echo "   • Update documentation when adding new features"

# Next steps
echo ""
print_info "🎯 NEXT STEPS:"
echo "1. Run 'npm test' to execute the test suite"
echo "2. Run 'npx hardhat compile' to compile contracts"
echo "3. Review and customize deployment scripts in scripts/"
echo "4. Read docs/ONBOARDING.md for detailed development workflow"
echo ""
print_status "Setup complete! Happy coding! 🎉"
echo ""
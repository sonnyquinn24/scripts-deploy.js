# Changelog

## Naming Convention Refactoring (2025-08-31)

This major refactoring update enforces unified naming conventions across the entire repository.

### Files Renamed (kebab-case)
- `scripts/deploy-DE.js` → `scripts/deploy-de.js`
- `contracts/SEQICO.sol` → `contracts/seq-ico.sol`
- `contracts/SEQToken.sol` → `contracts/seq-token.sol`

### Contract Names Updated (PascalCase)
- `SEQICO` → `SeqIco`
- `SEQToken` → `SeqToken`

### Function Names Updated (camelCase)
- `setSEQToken()` → `setSeqToken()`

### Variable Names Updated (camelCase)
- `ICO` → `ICO_ADDRESS` (for clarity as a constant address)
- All other variables already followed camelCase convention

### Constants (UPPER_SNAKE_CASE)
- `OWNER` - already correctly formatted
- `ICO_ADDRESS` - updated for consistency

### Files Updated
- `/scripts/deploy.js` - Updated to use new contract names and conventions
- `/scripts/deploy-de.js` - Updated to use new contract names and conventions
- `/contracts/seq-ico.sol` - Renamed file and updated contract name
- `/contracts/seq-token.sol` - Renamed file and updated contract name
- `/README.md` - Updated documentation to reflect new naming
- `/hardhat.config.js` - Added proper toolbox import
- `/package.json` - Updated dependencies for compatibility
- `/.github/workflows/ci-cd.yml` - Verified compatibility with new script names

### Technical Updates
- Fixed OpenZeppelin Ownable constructor compatibility
- Updated import statements for ES modules compatibility
- Added missing hardhat-ethers dependency
- Ensured all scripts compile and deploy successfully

### Verification
- ✅ All contracts compile successfully
- ✅ Both deployment scripts run without errors
- ✅ Proper token distribution (10% owner, 90% ICO)
- ✅ Contract functionality verified through test deployments

### Breaking Changes
- Contract names have changed - any external integrations must be updated
- File names have changed - CI/CD and deployment scripts must reference new paths
- Function name `setSEQToken` is now `setSeqToken`

### Migration Guide
1. Update any external references to contract names:
   - `SEQICO` → `SeqIco`
   - `SEQToken` → `SeqToken`
2. Update any file path references:
   - `deploy-DE.js` → `deploy-de.js`
   - `SEQICO.sol` → `seq-ico.sol`
   - `SEQToken.sol` → `seq-token.sol`
3. Update function calls:
   - `setSEQToken()` → `setSeqToken()`
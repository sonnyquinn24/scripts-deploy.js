// Basic validation test for deployment configuration
console.log("Running deployment configuration tests...");

// Test 1: Check that required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'scripts/deploy-development.js',
  'scripts/deploy-production.js',
  '.env.example',
  '.eslintrc.json',
  'jsdoc.config.json',
  '.husky/pre-commit'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

// Test 2: Check deployment script syntax
console.log("\nTesting deployment script syntax...");
try {
  const { execSync } = require('child_process');
  execSync('node -c scripts/deploy-development.js', { stdio: 'pipe' });
  execSync('node -c scripts/deploy-production.js', { stdio: 'pipe' });
  console.log("✅ Deployment scripts have valid syntax");
} catch (error) {
  console.log("❌ Deployment script syntax check failed:", error.message);
  allFilesExist = false;
}

// Test 3: Check package.json scripts
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['deploy:dev', 'deploy:prod', 'lint', 'docs'];
requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`✅ npm script '${script}' defined`);
  } else {
    console.log(`❌ npm script '${script}' missing`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log("\n🎉 All deployment configuration tests passed!");
  process.exit(0);
} else {
  console.log("\n❌ Some tests failed!");
  process.exit(1);
}
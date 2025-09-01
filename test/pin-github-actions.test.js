import fs from 'fs';
import path from 'path';
import { GitHubActionsPinner } from '../scripts/pin-github-actions.js';

// Mock test data
const testWorkflowContent = `name: Test Workflow

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v3
    
    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: 18
    
    - name: Already pinned action
      uses: actions/cache@704facf57e6136b1bc63b828d79edcd491f0ee84
      
    - name: Custom action
      uses: company/custom-action@v1.2.3
`;

const testWorkflowAlreadyPinned = `name: Already Pinned

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@704facf57e6136b1bc63b828d79edcd491f0ee84
`;

const testWorkflowNoActions = `name: No Actions

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - name: Run script
      run: echo "Hello World"
`;

/**
 * Simple test runner
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async runAll() {
    console.log(`🧪 Running ${this.tests.length} test(s)...\n`);

    for (const test of this.tests) {
      try {
        await test.testFn();
        console.log(`✅ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${test.name}`);
        console.log(`   Error: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }
}

/**
 * Test helper functions
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function createTempDir() {
  const tempDir = `/tmp/github-actions-test-${Date.now()}`;
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

function createTestWorkflow(dir, filename, content) {
  const workflowsDir = path.join(dir, '.github', 'workflows');
  fs.mkdirSync(workflowsDir, { recursive: true });
  const filePath = path.join(workflowsDir, filename);
  fs.writeFileSync(filePath, content);
  return filePath;
}

function cleanup(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Mock GitHub API for testing
 */
class MockOctokit {
  constructor() {
    this.rest = {
      repos: {
        listTags: this.mockListTags.bind(this),
        getBranch: this.mockGetBranch.bind(this)
      }
    };
  }

  async mockListTags({ owner, repo }) {
    if (owner === 'actions' && repo === 'checkout') {
      return {
        data: [
          { name: 'v4.1.7', commit: { sha: 'a1b2c3d4e5f6789012345678901234567890abcd' } },
          { name: 'v3.6.0', commit: { sha: 'b2c3d4e5f6789012345678901234567890abcdef' } }
        ]
      };
    }
    if (owner === 'actions' && repo === 'setup-node') {
      return {
        data: [
          { name: 'v4.0.2', commit: { sha: 'c3d4e5f6789012345678901234567890abcdef12' } },
          { name: 'v3.8.1', commit: { sha: 'd4e5f6789012345678901234567890abcdef1234' } }
        ]
      };
    }
    throw new Error('Repository not found');
  }

  async mockGetBranch({ owner, repo, branch }) {
    if (owner === 'company' && repo === 'custom-action' && branch === 'v1.2.3') {
      return {
        data: {
          commit: { sha: 'e5f6789012345678901234567890abcdef123456' }
        }
      };
    }
    throw new Error('Branch not found');
  }
}

/**
 * Tests
 */
async function runTests() {
  const runner = new TestRunner();

  // Test 1: Find workflow files
  runner.addTest('Should find workflow files', async () => {
    const tempDir = createTempDir();
    try {
      createTestWorkflow(tempDir, 'test.yml', testWorkflowContent);
      createTestWorkflow(tempDir, 'test2.yaml', testWorkflowContent);
      
      const pinner = new GitHubActionsPinner({
        workflowsDir: path.join(tempDir, '.github', 'workflows'),
        dryRun: true
      });
      
      const files = pinner.findWorkflowFiles();
      assert(files.length === 2, `Expected 2 files, got ${files.length}`);
      assert(files.some(f => f.endsWith('test.yml')), 'Should find test.yml');
      assert(files.some(f => f.endsWith('test2.yaml')), 'Should find test2.yaml');
    } finally {
      cleanup(tempDir);
    }
  });

  // Test 2: Parse unpinned actions
  runner.addTest('Should identify unpinned actions', async () => {
    const tempDir = createTempDir();
    try {
      const filePath = createTestWorkflow(tempDir, 'test.yml', testWorkflowContent);
      
      const pinner = new GitHubActionsPinner({
        workflowsDir: path.join(tempDir, '.github', 'workflows'),
        dryRun: true
      });
      
      const content = fs.readFileSync(filePath, 'utf8');
      const yaml = await import('js-yaml');
      const workflow = yaml.load(content);
      const actions = pinner.findUnpinnedActions(workflow);
      
      assert(actions.length === 3, `Expected 3 unpinned actions, got ${actions.length}`);
      
      const actionNames = actions.map(a => a.full);
      assert(actionNames.includes('actions/checkout@v3'), 'Should find checkout@v3');
      assert(actionNames.includes('actions/setup-node@v3'), 'Should find setup-node@v3');
      assert(actionNames.includes('company/custom-action@v1.2.3'), 'Should find custom-action@v1.2.3');
    } finally {
      cleanup(tempDir);
    }
  });

  // Test 3: Skip already pinned actions
  runner.addTest('Should skip already pinned actions', async () => {
    const tempDir = createTempDir();
    try {
      const filePath = createTestWorkflow(tempDir, 'pinned.yml', testWorkflowAlreadyPinned);
      
      const pinner = new GitHubActionsPinner({
        workflowsDir: path.join(tempDir, '.github', 'workflows'),
        dryRun: true
      });
      
      const content = fs.readFileSync(filePath, 'utf8');
      const yaml = await import('js-yaml');
      const workflow = yaml.load(content);
      const actions = pinner.findUnpinnedActions(workflow);
      
      assert(actions.length === 0, `Expected 0 unpinned actions, got ${actions.length}`);
    } finally {
      cleanup(tempDir);
    }
  });

  // Test 4: Handle workflows with no actions
  runner.addTest('Should handle workflows with no actions', async () => {
    const tempDir = createTempDir();
    try {
      const filePath = createTestWorkflow(tempDir, 'no-actions.yml', testWorkflowNoActions);
      
      const pinner = new GitHubActionsPinner({
        workflowsDir: path.join(tempDir, '.github', 'workflows'),
        dryRun: true
      });
      
      const result = await pinner.processWorkflowFile(filePath);
      assert(result.updates === 0, `Expected 0 updates, got ${result.updates}`);
      assert(result.errors.length === 0, `Expected 0 errors, got ${result.errors.length}`);
    } finally {
      cleanup(tempDir);
    }
  });

  // Test 5: Dry run mode
  runner.addTest('Should not modify files in dry run mode', async () => {
    const tempDir = createTempDir();
    try {
      const filePath = createTestWorkflow(tempDir, 'test.yml', testWorkflowContent);
      const originalContent = fs.readFileSync(filePath, 'utf8');
      
      const pinner = new GitHubActionsPinner({
        workflowsDir: path.join(tempDir, '.github', 'workflows'),
        dryRun: true
      });
      
      // Mock the GitHub API
      pinner.octokit = new MockOctokit();
      
      await pinner.processWorkflowFile(filePath);
      
      const afterContent = fs.readFileSync(filePath, 'utf8');
      assert(originalContent === afterContent, 'File should not be modified in dry run mode');
    } finally {
      cleanup(tempDir);
    }
  });

  // Test 6: File modification
  runner.addTest('Should modify files when not in dry run mode', async () => {
    const tempDir = createTempDir();
    try {
      const filePath = createTestWorkflow(tempDir, 'test.yml', testWorkflowContent);
      const originalContent = fs.readFileSync(filePath, 'utf8');
      
      const pinner = new GitHubActionsPinner({
        workflowsDir: path.join(tempDir, '.github', 'workflows'),
        dryRun: false
      });
      
      // Mock the GitHub API
      pinner.octokit = new MockOctokit();
      
      const result = await pinner.processWorkflowFile(filePath);
      
      const afterContent = fs.readFileSync(filePath, 'utf8');
      assert(originalContent !== afterContent, 'File should be modified when not in dry run mode');
      assert(result.updates > 0, 'Should have updates');
      assert(!afterContent.includes('@v3'), 'Should not contain @v3 references');
    } finally {
      cleanup(tempDir);
    }
  });

  // Test 7: YAML validation
  runner.addTest('Should validate YAML after modifications', async () => {
    const tempDir = createTempDir();
    try {
      const filePath = createTestWorkflow(tempDir, 'test.yml', testWorkflowContent);
      
      const pinner = new GitHubActionsPinner({
        workflowsDir: path.join(tempDir, '.github', 'workflows'),
        dryRun: false
      });
      
      // Mock the GitHub API
      pinner.octokit = new MockOctokit();
      
      const result = await pinner.processWorkflowFile(filePath);
      
      // Verify the updated file is valid YAML
      const updatedContent = fs.readFileSync(filePath, 'utf8');
      const yaml = await import('js-yaml');
      
      let parsedYaml;
      try {
        parsedYaml = yaml.load(updatedContent);
      } catch (error) {
        throw new Error(`Updated YAML is invalid: ${error.message}`);
      }
      
      assert(parsedYaml !== null, 'YAML should parse successfully');
      assert(parsedYaml.jobs !== undefined, 'Jobs should be present');
    } finally {
      cleanup(tempDir);
    }
  });

  return await runner.runAll();
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 GitHub Actions Pinner Tests');
  console.log('==============================\n');
  
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test runner error:', error.message);
    process.exit(1);
  });
}

export { runTests };
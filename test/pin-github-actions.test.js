import { strict as assert } from 'assert';
import { GitHubActionsPinner } from '../scripts/pin-github-actions.js';

// Simple test runner
async function runTests() {
  console.log('🧪 Running tests for GitHub Actions Pinner...\n');
  
  const tests = [
    {
      name: 'parseActionReference - unpinned actions',
      test: () => {
        const pinner = new GitHubActionsPinner();
        const result = pinner.parseActionReference('actions/checkout@v3');
        
        assert.equal(result.actionPath, 'actions/checkout');
        assert.equal(result.ref, 'v3');
        assert.equal(result.isPinned, false);
      }
    },
    {
      name: 'parseActionReference - pinned actions',
      test: () => {
        const pinner = new GitHubActionsPinner();
        const sha = '8e5e7e5ab8b370d6c329ec480221332ada57f0ab';
        const result = pinner.parseActionReference(`actions/checkout@${sha}`);
        
        assert.equal(result.isPinned, true);
      }
    },
    {
      name: 'parseActionReference - local actions',
      test: () => {
        const pinner = new GitHubActionsPinner();
        const result = pinner.parseActionReference('./local-action');
        
        assert.equal(result, null);
      }
    },
    {
      name: 'parseActionReference - invalid actions',
      test: () => {
        const pinner = new GitHubActionsPinner();
        const result = pinner.parseActionReference('invalid-action');
        
        assert.equal(result, null);
      }
    },
    {
      name: 'validateWorkflowFile - valid YAML',
      test: () => {
        const pinner = new GitHubActionsPinner();
        const validYaml = 'name: Test\non: push';
        
        assert.equal(pinner.validateWorkflowFile('test.yml', validYaml), true);
      }
    },
    {
      name: 'validateWorkflowFile - invalid YAML',
      test: () => {
        const pinner = new GitHubActionsPinner();
        const invalidYaml = 'name: Test\non: push\ninvalid: - yaml: syntax';
        
        assert.equal(pinner.validateWorkflowFile('test.yml', invalidYaml), false);
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      test.test();
      console.log(`✅ ${test.name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

export { runTests };
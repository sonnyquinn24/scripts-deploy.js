#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { Octokit } from '@octokit/rest';

class GitHubActionsPinner {
  constructor(options = {}) {
    this.octokit = new Octokit({
      auth: options.token || process.env.GITHUB_TOKEN,
      userAgent: 'github-actions-pinner/1.0.0'
    });
    this.workflowsDir = options.workflowsDir || '.github/workflows';
    this.dryRun = options.dryRun || false;
    this.cache = new Map(); // Cache for commit SHAs to avoid duplicate API calls
  }

  /**
   * Main function to pin all GitHub Actions in workflow files
   */
  async pinActions() {
    console.log('🔍 Scanning for workflow files...');
    
    const workflowFiles = this.findWorkflowFiles();
    if (workflowFiles.length === 0) {
      console.log('❌ No workflow files found in', this.workflowsDir);
      return false;
    }

    console.log(`📁 Found ${workflowFiles.length} workflow file(s):`);
    workflowFiles.forEach(file => console.log(`   - ${file}`));

    let totalUpdates = 0;
    const results = [];

    for (const filePath of workflowFiles) {
      console.log(`\n🔧 Processing ${filePath}...`);
      const result = await this.processWorkflowFile(filePath);
      results.push(result);
      totalUpdates += result.updates;
    }

    console.log(`\n✅ Processing complete!`);
    console.log(`📊 Summary: ${totalUpdates} action(s) pinned across ${workflowFiles.length} file(s)`);
    
    if (this.dryRun) {
      console.log('🔍 Dry run mode - no files were modified');
    }

    return totalUpdates > 0;
  }

  /**
   * Find all workflow YAML files
   */
  findWorkflowFiles() {
    if (!fs.existsSync(this.workflowsDir)) {
      return [];
    }

    return fs.readdirSync(this.workflowsDir)
      .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
      .map(file => path.join(this.workflowsDir, file));
  }

  /**
   * Process a single workflow file
   */
  async processWorkflowFile(filePath) {
    const result = {
      file: filePath,
      updates: 0,
      errors: [],
      actions: []
    };

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const workflow = yaml.load(content);
      
      if (!workflow || !workflow.jobs) {
        result.errors.push('Invalid workflow structure - no jobs found');
        return result;
      }

      const unpinnedActions = this.findUnpinnedActions(workflow);
      console.log(`   Found ${unpinnedActions.length} action(s) to process`);

      if (unpinnedActions.length === 0) {
        console.log('   ✅ All actions are already pinned or no actions found');
        return result;
      }

      // Get commit SHAs for all unpinned actions
      const actionSHAs = await this.fetchCommitSHAs(unpinnedActions);
      
      // Update the workflow content
      let updatedContent = content;
      for (const action of unpinnedActions) {
        const sha = actionSHAs.get(action.full);
        if (sha) {
          const oldUses = `uses: ${action.full}`;
          const newUses = `uses: ${action.repo}@${sha}`;
          
          // Use regex to replace the specific line to avoid partial matches
          const regex = new RegExp(`(\\s+uses:\\s+)${action.full.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
          updatedContent = updatedContent.replace(regex, `$1${action.repo}@${sha}`);
          
          result.actions.push({
            action: action.full,
            sha: sha,
            updated: true
          });
          result.updates++;
          
          console.log(`   ✅ ${action.full} → ${action.repo}@${sha.substring(0, 7)}...`);
        } else {
          result.errors.push(`Failed to get commit SHA for ${action.full}`);
          result.actions.push({
            action: action.full,
            sha: null,
            updated: false
          });
          console.log(`   ❌ Failed to pin ${action.full}`);
        }
      }

      // Validate the updated YAML
      if (result.updates > 0) {
        try {
          yaml.load(updatedContent);
          
          if (!this.dryRun) {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            console.log(`   💾 File updated successfully`);
          } else {
            console.log(`   🔍 Would update file (dry run mode)`);
          }
        } catch (yamlError) {
          result.errors.push(`YAML validation failed after updates: ${yamlError.message}`);
          console.log(`   ❌ YAML validation failed - changes not saved`);
        }
      }

    } catch (error) {
      result.errors.push(`Error processing file: ${error.message}`);
      console.log(`   ❌ Error: ${error.message}`);
    }

    return result;
  }

  /**
   * Find all unpinned GitHub Actions in a workflow
   */
  findUnpinnedActions(workflow) {
    const actions = [];
    const actionPattern = /^([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)@(v?\d+(?:\.\d+)*(?:\.\d+)?|main|master|latest)$/;

    const processSteps = (steps) => {
      if (!Array.isArray(steps)) return;
      
      for (const step of steps) {
        if (step.uses && typeof step.uses === 'string') {
          const match = step.uses.match(actionPattern);
          if (match) {
            const [, repo, tag] = match;
            actions.push({
              full: step.uses,
              repo: repo,
              tag: tag
            });
          }
        }
      }
    };

    // Process all jobs and their steps
    for (const [jobName, job] of Object.entries(workflow.jobs)) {
      if (job.steps) {
        processSteps(job.steps);
      }
    }

    return actions;
  }

  /**
   * Fetch commit SHAs for multiple actions
   */
  async fetchCommitSHAs(actions) {
    const shaMap = new Map();
    const uniqueActions = [...new Set(actions.map(a => a.full))];

    console.log(`   🌐 Fetching commit SHAs for ${uniqueActions.length} unique action(s)...`);

    for (const actionFull of uniqueActions) {
      try {
        const sha = await this.getLatestCommitSHA(actionFull);
        shaMap.set(actionFull, sha);
      } catch (error) {
        console.log(`   ❌ Failed to fetch SHA for ${actionFull}: ${error.message}`);
        shaMap.set(actionFull, null);
      }
    }

    return shaMap;
  }

  /**
   * Get the latest commit SHA for a GitHub Action
   */
  async getLatestCommitSHA(actionSpec) {
    // Check cache first
    if (this.cache.has(actionSpec)) {
      return this.cache.get(actionSpec);
    }

    const [repo, tag] = actionSpec.split('@');
    const [owner, repoName] = repo.split('/');

    try {
      // For version tags, get the specific tag
      if (tag.match(/^v?\d+(\.\d+)*$/)) {
        const { data } = await this.octokit.rest.repos.listTags({
          owner,
          repo: repoName,
          per_page: 100
        });

        // Find exact match first, then try major version match
        let targetTag = data.find(t => t.name === tag);
        
        if (!targetTag && tag.match(/^v?\d+$/)) {
          // For major version tags like 'v3', find the latest patch version
          const majorVersion = tag.replace('v', '');
          targetTag = data.find(t => t.name.startsWith(`v${majorVersion}.`) || t.name.startsWith(`${majorVersion}.`));
        }

        if (targetTag) {
          this.cache.set(actionSpec, targetTag.commit.sha);
          return targetTag.commit.sha;
        }
      }

      // Fallback to latest commit on the tag/branch
      const { data } = await this.octokit.rest.repos.getBranch({
        owner,
        repo: repoName,
        branch: tag
      });

      const sha = data.commit.sha;
      this.cache.set(actionSpec, sha);
      return sha;

    } catch (error) {
      if (error.status === 404) {
        throw new Error(`Repository ${repo} or tag/branch ${tag} not found`);
      }
      throw new Error(`GitHub API error: ${error.message}`);
    }
  }
}

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    token: process.env.GITHUB_TOKEN
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
GitHub Actions Pinner

Usage: node scripts/pin-github-actions.js [options]

Options:
  --dry-run, -d    Show what would be changed without modifying files
  --help, -h       Show this help message

Environment Variables:
  GITHUB_TOKEN     GitHub personal access token (optional, but recommended for rate limiting)

Examples:
  npm run pin-actions
  npm run pin-actions -- --dry-run
  GITHUB_TOKEN=ghp_xxx npm run pin-actions
`);
    return;
  }

  console.log('🚀 GitHub Actions Pinner');
  console.log('=======================\n');

  if (options.dryRun) {
    console.log('🔍 Running in dry-run mode\n');
  }

  if (!options.token) {
    console.log('⚠️  No GITHUB_TOKEN provided. Rate limiting may apply.\n');
  }

  try {
    const pinner = new GitHubActionsPinner(options);
    const hasUpdates = await pinner.pinActions();
    
    if (hasUpdates && !options.dryRun) {
      console.log('\n💡 Don\'t forget to commit these changes:');
      console.log('   git add .github/workflows/');
      console.log('   git commit -m "Pin GitHub Actions to full-length commit SHAs for improved security"');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { GitHubActionsPinner };
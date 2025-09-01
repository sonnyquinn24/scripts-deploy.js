#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { Octokit } from '@octokit/rest';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GitHubActionsPinner {
  constructor(options = {}) {
    this.octokit = new Octokit({
      auth: options.token || process.env.GITHUB_TOKEN,
    });
    this.workflowsDir = options.workflowsDir || path.join(process.cwd(), '.github', 'workflows');
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
  }

  /**
   * Log verbose messages
   */
  log(message) {
    if (this.verbose) {
      console.log(`[INFO] ${message}`);
    }
  }

  /**
   * Find all workflow files in the .github/workflows directory
   */
  async findWorkflowFiles() {
    this.log(`Searching for workflow files in ${this.workflowsDir}`);
    
    if (!fs.existsSync(this.workflowsDir)) {
      throw new Error(`Workflows directory not found: ${this.workflowsDir}`);
    }

    const files = fs.readdirSync(this.workflowsDir)
      .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
      .map(file => path.join(this.workflowsDir, file));

    this.log(`Found ${files.length} workflow files: ${files.map(f => path.basename(f)).join(', ')}`);
    return files;
  }

  /**
   * Parse a workflow file and extract GitHub Actions
   */
  async parseWorkflowFile(filePath) {
    this.log(`Parsing workflow file: ${path.basename(filePath)}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const workflow = yaml.load(content);
    const actions = [];

    if (!workflow || typeof workflow !== 'object' || !workflow.jobs) {
      this.log(`No jobs found in workflow file: ${path.basename(filePath)}`);
      return { content, workflow, actions };
    }

    // Extract actions from all jobs and steps
    for (const [jobName, job] of Object.entries(workflow.jobs)) {
      if (job.steps && Array.isArray(job.steps)) {
        for (const [stepIndex, step] of job.steps.entries()) {
          if (step.uses && typeof step.uses === 'string') {
            const actionRef = this.parseActionReference(step.uses);
            if (actionRef && !actionRef.isPinned) {
              actions.push({
                jobName,
                stepIndex,
                stepName: step.name || 'Unnamed step',
                originalUses: step.uses,
                ...actionRef
              });
            }
          }
        }
      }
    }

    this.log(`Found ${actions.length} unpinned actions in ${path.basename(filePath)}`);
    return { content, workflow, actions };
  }

  /**
   * Parse an action reference (e.g., "actions/checkout@v3")
   */
  parseActionReference(uses) {
    const actionPattern = /^([^@]+)@(.+)$/;
    const match = uses.match(actionPattern);
    
    if (!match) {
      this.log(`Skipping invalid action reference: ${uses}`);
      return null;
    }

    const [, actionPath, ref] = match;
    
    // Check if it's already pinned to a full SHA (40 characters)
    const isPinned = /^[a-f0-9]{40}$/.test(ref);
    
    // Only process GitHub-hosted actions
    if (!actionPath.includes('/') || actionPath.startsWith('./') || actionPath.startsWith('../')) {
      this.log(`Skipping local/relative action: ${uses}`);
      return null;
    }

    return {
      actionPath,
      ref,
      isPinned,
      isGitHubAction: true
    };
  }

  /**
   * Fetch the latest commit SHA for a GitHub Action
   */
  async fetchLatestCommitSHA(actionPath, ref) {
    this.log(`Fetching latest commit SHA for ${actionPath}@${ref}`);
    
    const [owner, repo] = actionPath.split('/');
    
    try {
      // First, try to get the specific ref (tag/branch)
      let response;
      try {
        response = await this.octokit.rest.repos.getBranch({
          owner,
          repo,
          branch: ref
        });
        this.log(`Found branch ${ref} for ${actionPath}: ${response.data.commit.sha}`);
        return response.data.commit.sha;
      } catch (branchError) {
        // If it's not a branch, try as a tag
        try {
          response = await this.octokit.rest.git.getRef({
            owner,
            repo,
            ref: `tags/${ref}`
          });
          this.log(`Found tag ${ref} for ${actionPath}: ${response.data.object.sha}`);
          return response.data.object.sha;
        } catch (tagError) {
          throw new Error(`Could not find ref '${ref}' for ${actionPath}. It might not exist or be accessible.`);
        }
      }
    } catch (error) {
      throw new Error(`Failed to fetch commit SHA for ${actionPath}@${ref}: ${error.message}`);
    }
  }

  /**
   * Update workflow file with pinned actions
   */
  async updateWorkflowFile(filePath, content, actions, commitSHAs) {
    this.log(`Updating workflow file: ${path.basename(filePath)}`);
    
    let updatedContent = content;
    let totalUpdatesCount = 0;

    // Group actions by their original reference to avoid double replacements
    const uniqueActions = new Map();
    for (const action of actions) {
      const key = action.originalUses;
      if (!uniqueActions.has(key)) {
        uniqueActions.set(key, action);
      }
    }

    for (const action of uniqueActions.values()) {
      const commitSHA = commitSHAs[`${action.actionPath}@${action.ref}`];
      if (commitSHA) {
        const newUses = `${action.actionPath}@${commitSHA}`;
        const oldPattern = new RegExp(`uses:\\s*${action.originalUses.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
        
        // Count how many instances we're replacing
        const matches = updatedContent.match(oldPattern);
        const instanceCount = matches ? matches.length : 0;
        
        if (instanceCount > 0) {
          updatedContent = updatedContent.replace(oldPattern, `uses: ${newUses}`);
          totalUpdatesCount += instanceCount;
          this.log(`Updated ${action.originalUses} → ${newUses} (${instanceCount} instances)`);
        }
      }
    }

    if (totalUpdatesCount > 0) {
      if (!this.dryRun) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        this.log(`Saved ${totalUpdatesCount} updates to ${path.basename(filePath)}`);
      } else {
        this.log(`[DRY RUN] Would save ${totalUpdatesCount} updates to ${path.basename(filePath)}`);
      }
    }

    return { updatedContent, updatesCount: totalUpdatesCount };
  }

  /**
   * Find the line number of an action in the content
   */
  findActionLineNumber(content, uses) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(uses)) {
        return i;
      }
    }
    return 0;
  }

  /**
   * Validate that the updated workflow file is still valid YAML
   */
  validateWorkflowFile(filePath, content) {
    try {
      yaml.load(content);
      this.log(`Validated workflow file: ${path.basename(filePath)}`);
      return true;
    } catch (error) {
      console.error(`Invalid YAML in ${path.basename(filePath)}: ${error.message}`);
      return false;
    }
  }

  /**
   * Main method to pin all GitHub Actions
   */
  async pinActions() {
    try {
      console.log('🔍 Scanning for GitHub Actions to pin...');
      
      const workflowFiles = await this.findWorkflowFiles();
      if (workflowFiles.length === 0) {
        console.log('✅ No workflow files found.');
        return { success: true, updates: 0, files: 0 };
      }

      let totalUpdates = 0;
      let filesUpdated = 0;
      const commitSHAs = {};

      // Parse all workflow files
      const workflowData = [];
      for (const filePath of workflowFiles) {
        const data = await this.parseWorkflowFile(filePath);
        workflowData.push({ filePath, ...data });
      }

      // Collect all unique actions that need pinning
      const uniqueActions = new Set();
      for (const { actions } of workflowData) {
        for (const action of actions) {
          uniqueActions.add(`${action.actionPath}@${action.ref}`);
        }
      }

      if (uniqueActions.size === 0) {
        console.log('✅ All GitHub Actions are already pinned to commit SHAs.');
        return { success: true, updates: 0, files: 0 };
      }

      console.log(`📍 Found ${uniqueActions.size} unique actions to pin:`);
      for (const actionRef of uniqueActions) {
        console.log(`  - ${actionRef}`);
      }

      // Fetch commit SHAs for all actions
      console.log('\n🔗 Fetching latest commit SHAs...');
      for (const actionRef of uniqueActions) {
        const [actionPath, ref] = actionRef.split('@');
        try {
          const sha = await this.fetchLatestCommitSHA(actionPath, ref);
          commitSHAs[actionRef] = sha;
          console.log(`✓ ${actionRef} → ${sha}`);
        } catch (error) {
          console.error(`✗ Failed to fetch SHA for ${actionRef}: ${error.message}`);
          return { success: false, error: error.message };
        }
      }

      // Update all workflow files
      console.log('\n📝 Updating workflow files...');
      for (const { filePath, content, actions } of workflowData) {
        if (actions.length > 0) {
          const { updatedContent, updatesCount } = await this.updateWorkflowFile(
            filePath, content, actions, commitSHAs
          );
          
          if (updatesCount > 0) {
            if (this.validateWorkflowFile(filePath, updatedContent)) {
              totalUpdates += updatesCount;
              filesUpdated++;
              console.log(`✓ Updated ${path.basename(filePath)} (${updatesCount} changes)`);
            } else {
              console.error(`✗ Validation failed for ${path.basename(filePath)}`);
              return { success: false, error: 'Workflow validation failed' };
            }
          }
        }
      }

      if (this.dryRun) {
        console.log(`\n🎯 [DRY RUN] Would update ${totalUpdates} actions in ${filesUpdated} files.`);
      } else {
        console.log(`\n🎯 Successfully pinned ${totalUpdates} actions in ${filesUpdated} files.`);
      }

      return { success: true, updates: totalUpdates, files: filesUpdated };
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    token: process.env.GITHUB_TOKEN
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
GitHub Actions Pinner

Usage: node pin-github-actions.js [options]

Options:
  --dry-run     Show what would be changed without making actual changes
  --verbose, -v Show detailed logging
  --help, -h    Show this help message

Environment Variables:
  GITHUB_TOKEN  GitHub personal access token (optional, but recommended to avoid rate limits)

Examples:
  node pin-github-actions.js --dry-run
  GITHUB_TOKEN=your_token node pin-github-actions.js --verbose
`);
    return;
  }

  const pinner = new GitHubActionsPinner(options);
  const result = await pinner.pinActions();
  
  if (!result.success) {
    process.exit(1);
  }
}

// Export for testing
export { GitHubActionsPinner };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
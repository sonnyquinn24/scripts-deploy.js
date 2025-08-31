#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ScriptsDeployMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "scripts-deploy-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupPromptHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "compile_contracts",
            description: "Compile smart contracts using Hardhat",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "deploy_contracts",
            description: "Deploy smart contracts using the deployment script",
            inputSchema: {
              type: "object",
              properties: {
                script: {
                  type: "string",
                  description: "Deployment script to use (deploy.js or deploy-DE.js)",
                  enum: ["deploy.js", "deploy-DE.js"],
                },
                network: {
                  type: "string",
                  description: "Network to deploy to (optional)",
                },
              },
            },
          },
          {
            name: "get_contract_info",
            description: "Get information about deployed contracts",
            inputSchema: {
              type: "object",
              properties: {
                contract: {
                  type: "string",
                  description: "Contract name (SEQToken or SEQICO)",
                  enum: ["SEQToken", "SEQICO"],
                },
              },
              required: ["contract"],
            },
          },
          {
            name: "get_deployment_status",
            description: "Check the status of contract deployments",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "compile_contracts":
            return await this.compileContracts();
          
          case "deploy_contracts":
            return await this.deployContracts(args.script, args.network);
          
          case "get_contract_info":
            return await this.getContractInfo(args.contract);
          
          case "get_deployment_status":
            return await this.getDeploymentStatus();
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  setupPromptHandlers() {
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "deployment_guide",
            description: "Guide for deploying SEQICO smart contracts",
          },
          {
            name: "contract_interaction",
            description: "Guide for interacting with deployed contracts",
          },
        ],
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name } = request.params;

      switch (name) {
        case "deployment_guide":
          return {
            description: "Step-by-step deployment guide for SEQICO contracts",
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: "How do I deploy the SEQICO smart contracts?",
                },
              },
              {
                role: "assistant",
                content: {
                  type: "text",
                  text: `To deploy the SEQICO smart contracts:

1. First, compile the contracts:
   npx hardhat compile

2. Deploy using one of the deployment scripts:
   - For main deployment: npx hardhat run scripts/deploy.js
   - For DE deployment: npx hardhat run scripts/deploy-DE.js

3. The deployment process will:
   - Deploy the SEQICO contract first with a dummy token address
   - Deploy the SEQToken contract with 10% to owner, 90% to ICO
   - Update the SEQICO contract with the real SEQ token address
   - Display the deployed contract addresses and balances

Contract addresses and configuration:
- Owner: 0x4B958C04701616A0ffF821E9b2db130983c5f3E4
- USDT: 0xdac17f958d2ee523a2206206994597c13d831ec7
- USDC: 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913
- Total Supply: 500,000 SEQ tokens
- Pricing: 0.01 ETH, 10 USDT, 10 USDC per SEQ token`,
                },
              },
            ],
          };

        case "contract_interaction":
          return {
            description: "Guide for interacting with SEQICO contracts",
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: "How do I interact with the deployed SEQICO contracts?",
                },
              },
              {
                role: "assistant",
                content: {
                  type: "text",
                  text: `SEQICO Contract Functions:

Purchase Functions:
- buyWithETH(uint256 tokenAmount): Buy SEQ tokens with ETH
- buyWithUSDT(uint256 tokenAmount): Buy SEQ tokens with USDT (requires approval)
- buyWithUSDC(uint256 tokenAmount): Buy SEQ tokens with USDC (requires approval)

Owner Functions:
- setSEQToken(address _seqToken): Update SEQ token address
- withdrawETH(address payable recipient): Withdraw collected ETH
- withdrawERC20(address token, address recipient): Withdraw ERC20 tokens

SEQToken Contract:
- Standard ERC20 functions (transfer, approve, balanceOf, etc.)
- Initial distribution: 10% to owner, 90% to ICO contract

Example interaction:
1. For USDT/USDC purchases, first approve the SEQICO contract to spend tokens
2. Call the appropriate buy function with the desired token amount
3. Tokens will be transferred to your wallet automatically`,
                },
              },
            ],
          };

        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    });
  }

  async compileContracts() {
    try {
      const output = execSync('npx hardhat compile', { 
        cwd: __dirname,
        encoding: 'utf-8' 
      });
      
      return {
        content: [
          {
            type: "text",
            text: `Contracts compiled successfully:\n${output}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Compilation failed: ${error.message}`);
    }
  }

  async deployContracts(script = "deploy.js", network = "") {
    try {
      const scriptPath = join(__dirname, 'scripts', script);
      if (!existsSync(scriptPath)) {
        throw new Error(`Deployment script not found: ${script}`);
      }

      const command = network 
        ? `npx hardhat run scripts/${script} --network ${network}`
        : `npx hardhat run scripts/${script}`;
      
      const output = execSync(command, { 
        cwd: __dirname,
        encoding: 'utf-8' 
      });
      
      return {
        content: [
          {
            type: "text",
            text: `Deployment completed:\n${output}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Deployment failed: ${error.message}`);
    }
  }

  async getContractInfo(contractName) {
    try {
      const contractPath = join(__dirname, 'contracts', `${contractName}.sol`);
      if (!existsSync(contractPath)) {
        throw new Error(`Contract not found: ${contractName}`);
      }

      const contractCode = readFileSync(contractPath, 'utf-8');
      
      return {
        content: [
          {
            type: "text",
            text: `Contract: ${contractName}\n\nSource code:\n${contractCode}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get contract info: ${error.message}`);
    }
  }

  async getDeploymentStatus() {
    try {
      const artifactsPath = join(__dirname, 'artifacts');
      const exists = existsSync(artifactsPath);
      
      let status = "Contracts not compiled yet.";
      
      if (exists) {
        const seqTokenArtifact = join(artifactsPath, 'contracts', 'SEQToken.sol', 'SEQToken.json');
        const seqicoArtifact = join(artifactsPath, 'contracts', 'SEQICO.sol', 'SEQICO.json');
        
        const seqTokenExists = existsSync(seqTokenArtifact);
        const seqicoExists = existsSync(seqicoArtifact);
        
        if (seqTokenExists && seqicoExists) {
          status = "Contracts compiled successfully. Ready for deployment.";
        } else {
          status = "Contracts partially compiled. Run compile_contracts tool.";
        }
      }
      
      return {
        content: [
          {
            type: "text",
            text: `Deployment Status: ${status}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to check deployment status: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Scripts Deploy MCP server running on stdio");
  }
}

const server = new ScriptsDeployMCPServer();
server.run().catch(console.error);
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { Config, ConfigSchema } from './types.js';
import {
  listRepositories,
  listRepositoriesTool,
} from './tools/listRepositories.js';
import {
  getRepositoryCommits,
  getRepositoryCommitsTool,
} from './tools/getRepositoryCommits.js';
import {
  getRepositoryDetails,
  getRepositoryDetailsTool,
} from './tools/getRepositoryDetails.js';

class BitbucketMCPServer {
  private server: Server;
  private config: Config;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.server = new Server({
      name: 'bitbucket-mcp',
      version: '1.0.0',
      capabilities: {
        tools: {},
      },
    });

    // Validate environment variables
    this.config = ConfigSchema.parse({
      BITBUCKET_USERNAME: process.env.BITBUCKET_USERNAME,
      BITBUCKET_APP_PASSWORD: process.env.BITBUCKET_APP_PASSWORD,
      BITBUCKET_WORKSPACE: process.env.BITBUCKET_WORKSPACE,
    });

    // Setup Axios instance with authentication
    this.axiosInstance = axios.create({
      baseURL: 'https://api.bitbucket.org/2.0',
      auth: {
        username: this.config.BITBUCKET_USERNAME,
        password: this.config.BITBUCKET_APP_PASSWORD,
      },
      timeout: 30000,
    });

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        listRepositoriesTool,
        getRepositoryCommitsTool,
        getRepositoryDetailsTool,
      ],
    }));

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: CallToolRequest) => {
        const args = request.params.arguments || {};
        switch (request.params.name) {
          case 'list_repositories':
            return await listRepositories(this.axiosInstance, this.config, args);
          case 'get_repository_commits':
            return await getRepositoryCommits(
              this.axiosInstance,
              this.config,
              args
            );
          case 'get_repository_details':
            return await getRepositoryDetails(
              this.axiosInstance,
              this.config,
              args
            );
          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      }
    );
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Bitbucket MCP Server running on stdio');
  }
}

const server = new BitbucketMCPServer();
server.run().catch(console.error); 
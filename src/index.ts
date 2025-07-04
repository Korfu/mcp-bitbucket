#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { Config, ConfigSchema } from './types.js';

// Repositories
import {
  listRepositories,
  listRepositoriesTool,
} from './tools/repositories/listRepositories.js';
import {
  getRepositoryDetails,
  getRepositoryDetailsTool,
} from './tools/repositories/getRepositoryDetails.js';

// Commits
import { listCommits, listCommitsTool } from './tools/commits/listCommits.js';
import { getCommit, getCommitTool } from './tools/commits/getCommit.js';

// Branching Model
import {
  updateRepositoryBranchingModelSettings,
  updateRepositoryBranchingModelSettingsTool,
} from './tools/branch-restrictions/updateRepositoryBranchingModelSettings.js';
import {
  updateProjectBranchingModelSettings,
  updateProjectBranchingModelSettingsTool,
} from './tools/branch-restrictions/updateProjectBranchingModelSettings.js';
import {
  listBranchRestrictions,
  listBranchRestrictionsTool,
} from './tools/branch-restrictions/listBranchRestrictions.js';
import {
  getBranchRestriction,
  getBranchRestrictionTool,
} from './tools/branch-restrictions/getBranchRestriction.js';

// Projects
import { getProject, getProjectTool } from './tools/projects/getProject.js';
import {
  listDefaultReviewers,
  listDefaultReviewersTool,
} from './tools/projects/listDefaultReviewers.js';

// Pull Requests
import {
  listPullRequests,
  listPullRequestsTool,
} from './tools/pull-requests/listPullRequests.js';
import {
  getPullRequest,
  getPullRequestTool,
} from './tools/pull-requests/getPullRequest.js';
import {
  createPullRequest,
  createPullRequestTool,
} from './tools/pull-requests/createPullRequest.js';
import {
  updatePullRequest,
  updatePullRequestTool,
} from './tools/pull-requests/updatePullRequest.js';

// Workspaces
import {
  listWorkspaces,
  listWorkspacesTool,
} from './tools/workspaces/listWorkspaces.js';

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
        // Repositories
        listRepositoriesTool,
        getRepositoryDetailsTool,
        // Commits
        listCommitsTool,
        getCommitTool,
        // Branching Model
        updateRepositoryBranchingModelSettingsTool,
        updateProjectBranchingModelSettingsTool,
        listBranchRestrictionsTool,
        getBranchRestrictionTool,
        // Projects
        getProjectTool,
        listDefaultReviewersTool,
        // Pull Requests
        listPullRequestsTool,
        getPullRequestTool,
        createPullRequestTool,
        updatePullRequestTool,
        // Workspaces
        listWorkspacesTool,
      ],
    }));

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: CallToolRequest) => {
        const args = request.params.arguments || {};
        const { name } = request.params;
        const handlers: Record<
          string,
          (
            axiosInstance: AxiosInstance,
            config: Config,
            args: any
          ) => Promise<{ content: Array<{ type: string; text: string }> }>
        > = {
          // Repositories
          list_repositories: listRepositories,
          get_repository_details: getRepositoryDetails,
          // Commits
          list_commits: listCommits,
          get_commit: getCommit,
          // Branching Model
          update_repository_branching_model_settings:
            updateRepositoryBranchingModelSettings,
          update_project_branching_model_settings:
            updateProjectBranchingModelSettings,
          list_branch_restrictions: listBranchRestrictions,
          get_branch_restriction: getBranchRestriction,
          // Projects
          get_project: getProject,
          list_default_reviewers: listDefaultReviewers,
          // Pull Requests
          list_pull_requests: listPullRequests,
          get_pull_request: getPullRequest,
          create_pull_request: createPullRequest,
          update_pull_request: updatePullRequest,
          // Workspaces
          list_workspaces: listWorkspaces,
        };

        if (name in handlers) {
          return await handlers[name](this.axiosInstance, this.config, args);
        } else {
          throw new Error(`Unknown tool: ${name}`);
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
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';

// Environment variables validation
const ConfigSchema = z.object({
  BITBUCKET_USERNAME: z.string().min(1, 'Bitbucket username is required'),
  BITBUCKET_APP_PASSWORD: z.string().min(1, 'Bitbucket app password is required'),
  BITBUCKET_WORKSPACE: z.string().min(1, 'Bitbucket workspace is required'),
});

type Config = z.infer<typeof ConfigSchema>;

// Bitbucket API types
interface BitbucketRepository {
  name: string;
  full_name: string;
  description?: string;
  created_on: string;
  updated_on: string;
  language?: string;
  size: number;
  is_private: boolean;
  links: {
    html: {
      href: string;
    };
  };
}

interface BitbucketCommit {
  hash: string;
  date: string;
  message: string;
  author: {
    raw: string;
    user?: {
      display_name: string;
    };
  };
}

interface BitbucketPaginatedResponse<T> {
  values: T[];
  page?: number;
  pagelen?: number;
  size?: number;
  next?: string;
}

interface RepositoryWithCommitInfo extends BitbucketRepository {
  commit_count?: number;
  latest_commit_date?: string;
  latest_commit_hash?: string;
  latest_commit_message?: string;
  latest_commit_author?: string;
}

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
        {
          name: 'list_repositories',
          description: 'List all repositories in the configured Bitbucket workspace',
          inputSchema: {
            type: 'object',
            properties: {
              include_commit_info: {
                type: 'boolean',
                description: 'Whether to include commit count and latest commit information for each repository',
                default: false,
              },
              limit: {
                type: 'number',
                description: 'Maximum number of repositories to return (default: 50, max: 100)',
                default: 50,
                minimum: 1,
                maximum: 100,
              },
            },
          },
        },
        {
          name: 'get_repository_commits',
          description: 'Get commit information for a specific repository',
          inputSchema: {
            type: 'object',
            properties: {
              repository_name: {
                type: 'string',
                description: 'Name of the repository (repo slug)',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of commits to return (default: 50, max: 100)',
                default: 50,
                minimum: 1,
                maximum: 100,
              },
            },
            required: ['repository_name'],
          },
        },
        {
          name: 'get_repository_details',
          description: 'Get detailed information about a specific repository including latest commit info',
          inputSchema: {
            type: 'object',
            properties: {
              repository_name: {
                type: 'string',
                description: 'Name of the repository (repo slug)',
              },
            },
            required: ['repository_name'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      switch (request.params.name) {
        case 'list_repositories':
          return await this.listRepositories(request.params.arguments || {});
        case 'get_repository_commits':
          return await this.getRepositoryCommits(request.params.arguments || {});
        case 'get_repository_details':
          return await this.getRepositoryDetails(request.params.arguments || {});
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  private async listRepositories(args: any): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const includeCommitInfo = args?.include_commit_info ?? false;
      const limit = Math.min(args?.limit ?? 50, 100);

      console.error(`Fetching repositories for workspace: ${this.config.BITBUCKET_WORKSPACE}`);
      
      const response = await this.axiosInstance.get<BitbucketPaginatedResponse<BitbucketRepository>>(
        `/repositories/${this.config.BITBUCKET_WORKSPACE}`,
        {
          params: {
            pagelen: limit,
            sort: '-updated_on',
          },
        }
      );

      let repositories: RepositoryWithCommitInfo[] = response.data.values;

      if (includeCommitInfo) {
        console.error('Fetching commit information for each repository...');
        
        // Fetch commit info for each repository in parallel
        const commitInfoPromises = repositories.map(async (repo) => {
          try {
            const commitResponse = await this.axiosInstance.get<BitbucketPaginatedResponse<BitbucketCommit>>(
              `/repositories/${this.config.BITBUCKET_WORKSPACE}/${repo.name}/commits`,
              {
                params: {
                  pagelen: 1,
                },
              }
            );

            // Get total commit count
            const commitCountResponse = await this.axiosInstance.get<BitbucketPaginatedResponse<BitbucketCommit>>(
              `/repositories/${this.config.BITBUCKET_WORKSPACE}/${repo.name}/commits`,
              {
                params: {
                  pagelen: 1,
                },
              }
            );

            const latestCommit = commitResponse.data.values[0];
            return {
              ...repo,
              commit_count: commitCountResponse.data.size || 0,
              latest_commit_date: latestCommit?.date,
              latest_commit_hash: latestCommit?.hash,
              latest_commit_message: latestCommit?.message,
              latest_commit_author: latestCommit?.author?.user?.display_name || latestCommit?.author?.raw,
            };
          } catch (error) {
            console.error(`Error fetching commit info for ${repo.name}:`, error);
            return {
              ...repo,
              commit_count: 0,
              latest_commit_date: undefined,
              latest_commit_hash: undefined,
              latest_commit_message: undefined,
              latest_commit_author: undefined,
            };
          }
        });

        repositories = await Promise.all(commitInfoPromises);
      }

      const summary = `Found ${repositories.length} repositories in workspace "${this.config.BITBUCKET_WORKSPACE}"${includeCommitInfo ? ' (with commit information)' : ''}`;
      
      const repositoryList = repositories
        .map((repo) => {
          let repoInfo = `**${repo.name}**
- Full Name: ${repo.full_name}
- Description: ${repo.description || 'No description'}
- Language: ${repo.language || 'Not specified'}
- Size: ${(repo.size / 1024).toFixed(2)} KB
- Private: ${repo.is_private ? 'Yes' : 'No'}
- Created: ${new Date(repo.created_on).toLocaleDateString()}
- Updated: ${new Date(repo.updated_on).toLocaleDateString()}
- URL: ${repo.links.html.href}`;

          if (includeCommitInfo) {
            repoInfo += `
- Commit Count: ${repo.commit_count || 0}
- Latest Commit: ${repo.latest_commit_date ? new Date(repo.latest_commit_date).toLocaleDateString() : 'No commits'}
- Latest Commit Hash: ${repo.latest_commit_hash || 'N/A'}
- Latest Commit Author: ${repo.latest_commit_author || 'N/A'}
- Latest Commit Message: ${repo.latest_commit_message || 'N/A'}`;
          }

          return repoInfo;
        })
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `${summary}\n\n${repositoryList}`,
          },
        ],
      };
    } catch (error) {
      console.error('Error fetching repositories:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching repositories: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async getRepositoryCommits(args: any): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const repositoryName = args?.repository_name;
      const limit = Math.min(args?.limit ?? 50, 100);

      if (!repositoryName) {
        throw new Error('Repository name is required');
      }

      console.error(`Fetching commits for repository: ${repositoryName}`);

      const response = await this.axiosInstance.get<BitbucketPaginatedResponse<BitbucketCommit>>(
        `/repositories/${this.config.BITBUCKET_WORKSPACE}/${repositoryName}/commits`,
        {
          params: {
            pagelen: limit,
          },
        }
      );

      const commits = response.data.values;
      const totalCommits = response.data.size || commits.length;

      const summary = `Found ${commits.length} recent commits (out of ${totalCommits} total) in repository "${repositoryName}"`;
      
      const commitList = commits
        .map((commit: BitbucketCommit, index: number) => `**Commit ${index + 1}**
- Hash: ${commit.hash}
- Date: ${new Date(commit.date).toLocaleString()}
- Author: ${commit.author?.user?.display_name || commit.author?.raw}
- Message: ${commit.message.split('\n')[0]}`
        )
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `${summary}\n\n${commitList}`,
          },
        ],
      };
    } catch (error) {
      console.error('Error fetching repository commits:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching repository commits: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async getRepositoryDetails(args: any): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const repositoryName = args?.repository_name;

      if (!repositoryName) {
        throw new Error('Repository name is required');
      }

      console.error(`Fetching details for repository: ${repositoryName}`);

      // Fetch repository info and latest commit in parallel
      const [repoResponse, commitResponse] = await Promise.all([
        this.axiosInstance.get<BitbucketRepository>(`/repositories/${this.config.BITBUCKET_WORKSPACE}/${repositoryName}`),
        this.axiosInstance.get<BitbucketPaginatedResponse<BitbucketCommit>>(
          `/repositories/${this.config.BITBUCKET_WORKSPACE}/${repositoryName}/commits`,
          {
            params: {
              pagelen: 1,
            },
          }
        ),
      ]);

      const repo = repoResponse.data;
      const latestCommit = commitResponse.data.values[0];
      const totalCommits = commitResponse.data.size || 0;

      const details = `**Repository Details: ${repo.name}**

**Basic Information:**
- Full Name: ${repo.full_name}
- Description: ${repo.description || 'No description'}
- Language: ${repo.language || 'Not specified'}
- Size: ${(repo.size / 1024).toFixed(2)} KB
- Private: ${repo.is_private ? 'Yes' : 'No'}
- Created: ${new Date(repo.created_on).toLocaleString()}
- Last Updated: ${new Date(repo.updated_on).toLocaleString()}
- URL: ${repo.links.html.href}

**Commit Information:**
- Total Commits: ${totalCommits}
- Latest Commit Date: ${latestCommit ? new Date(latestCommit.date).toLocaleString() : 'No commits'}
- Latest Commit Hash: ${latestCommit?.hash || 'N/A'}
- Latest Commit Author: ${latestCommit?.author?.user?.display_name || latestCommit?.author?.raw || 'N/A'}
- Latest Commit Message: ${latestCommit?.message || 'N/A'}`;

      return {
        content: [
          {
            type: 'text',
            text: details,
          },
        ],
      };
    } catch (error) {
      console.error('Error fetching repository details:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching repository details: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Bitbucket MCP Server running on stdio');
  }
}

const server = new BitbucketMCPServer();
server.run().catch(console.error); 
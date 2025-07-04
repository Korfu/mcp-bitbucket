import { AxiosInstance } from 'axios';
import {
  BitbucketPaginatedResponse,
  BitbucketRepository,
  BitbucketCommit,
  RepositoryWithCommitInfo,
  Config,
} from '../types';

export const listRepositoriesTool = {
  name: 'list_repositories',
  description: 'List all repositories in the configured Bitbucket workspace',
  inputSchema: {
    type: 'object',
    properties: {
      include_commit_info: {
        type: 'boolean',
        description:
          'Whether to include commit count and latest commit information for each repository',
        default: false,
      },
      limit: {
        type: 'number',
        description:
          'Maximum number of repositories to return (default: 50, max: 100)',
        default: 50,
        minimum: 1,
        maximum: 100,
      },
    },
  },
};

export async function listRepositories(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const includeCommitInfo = args?.include_commit_info ?? false;
    const limit = Math.min(args?.limit ?? 50, 100);

    console.error(
      `Fetching repositories for workspace: ${config.BITBUCKET_WORKSPACE}`
    );

    const response = await axiosInstance.get<
      BitbucketPaginatedResponse<BitbucketRepository>
    >(`/repositories/${config.BITBUCKET_WORKSPACE}`, {
      params: {
        pagelen: limit,
        sort: '-updated_on',
      },
    });

    let repositories: RepositoryWithCommitInfo[] = response.data.values;

    if (includeCommitInfo) {
      console.error('Fetching commit information for each repository...');

      const commitInfoPromises = repositories.map(async repo => {
        try {
          const commitResponse = await axiosInstance.get<
            BitbucketPaginatedResponse<BitbucketCommit>
          >(
            `/repositories/${config.BITBUCKET_WORKSPACE}/${repo.name}/commits`,
            {
              params: {
                pagelen: 1,
              },
            }
          );

          const commitCountResponse = await axiosInstance.get<
            BitbucketPaginatedResponse<BitbucketCommit>
          >(
            `/repositories/${config.BITBUCKET_WORKSPACE}/${repo.name}/commits`,
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
            latest_commit_author:
              latestCommit?.author?.user?.display_name ||
              latestCommit?.author?.raw,
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

    const summary = `Found ${
      repositories.length
    } repositories in workspace "${
      config.BITBUCKET_WORKSPACE
    }"${includeCommitInfo ? ' (with commit information)' : ''}`;

    const repositoryList = repositories
      .map(repo => {
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
- Latest Commit: ${
            repo.latest_commit_date
              ? new Date(repo.latest_commit_date).toLocaleDateString()
              : 'No commits'
          }
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
          text: `Error fetching repositories: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
    };
  }
} 
import { AxiosInstance } from 'axios';
import {
  BitbucketPaginatedResponse,
  BitbucketRepository,
  BitbucketCommit,
  Config,
} from '../types';

export const getRepositoryDetailsTool = {
  name: 'get_repository_details',
  description:
    'Get detailed information about a specific repository including latest commit info',
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
};

export async function getRepositoryDetails(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const repositoryName = args?.repository_name;

    if (!repositoryName) {
      throw new Error('Repository name is required');
    }

    console.error(`Fetching details for repository: ${repositoryName}`);

    // Fetch repository info and latest commit in parallel
    const [repoResponse, commitResponse] = await Promise.all([
      axiosInstance.get<BitbucketRepository>(
        `/repositories/${config.BITBUCKET_WORKSPACE}/${repositoryName}`
      ),
      axiosInstance.get<BitbucketPaginatedResponse<BitbucketCommit>>(
        `/repositories/${config.BITBUCKET_WORKSPACE}/${repositoryName}/commits`,
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
- Latest Commit Date: ${
      latestCommit ? new Date(latestCommit.date).toLocaleString() : 'No commits'
    }
- Latest Commit Hash: ${latestCommit?.hash || 'N/A'}
- Latest Commit Author: ${
      latestCommit?.author?.user?.display_name ||
      latestCommit?.author?.raw ||
      'N/A'
    }
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
          text: `Error fetching repository details: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
    };
  }
} 
import { AxiosInstance } from 'axios';
import {
  BitbucketPaginatedResponse,
  BitbucketCommit,
  Config,
} from '../../types';

export const getRepositoryCommitsTool = {
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
        description:
          'Maximum number of commits to return (default: 50, max: 100)',
        default: 50,
        minimum: 1,
        maximum: 100,
      },
    },
    required: ['repository_name'],
  },
};

export async function getRepositoryCommits(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const repositoryName = args?.repository_name;
    const limit = Math.min(args?.limit ?? 50, 100);

    if (!repositoryName) {
      throw new Error('Repository name is required');
    }

    console.error(`Fetching commits for repository: ${repositoryName}`);

    const response = await axiosInstance.get<
      BitbucketPaginatedResponse<BitbucketCommit>
    >(`/repositories/${config.BITBUCKET_WORKSPACE}/${repositoryName}/commits`, {
      params: {
        pagelen: limit,
      },
    });

    const commits = response.data.values;
    const totalCommits = response.data.size || commits.length;

    const summary = `Found ${commits.length} recent commits (out of ${totalCommits} total) in repository "${repositoryName}"`;

    const commitList = commits
      .map(
        (commit: BitbucketCommit, index: number) => `**Commit ${index + 1}**
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
          text: `Error fetching repository commits: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
    };
  }
} 
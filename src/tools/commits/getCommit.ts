import { AxiosInstance } from 'axios';
import { Config, BitbucketDetailedCommit } from '../../types';

export const getCommitTool = {
  name: 'get_commit',
  description: 'Get a single commit by its hash.',
  inputSchema: {
    type: 'object',
    properties: {
      repository_name: {
        type: 'string',
        description: 'Name of the repository (repo slug)',
      },
      commit_hash: {
        type: 'string',
        description: 'The hash of the commit.',
      },
    },
    required: ['repository_name', 'commit_hash'],
  },
};

export async function getCommit(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const { repository_name, commit_hash } = args;

    if (!repository_name) {
      throw new Error('Repository name is required');
    }
    if (!commit_hash) {
      throw new Error('Commit hash is required');
    }

    console.error(
      `Fetching commit ${commit_hash} for repository: ${repository_name}`
    );

    const response = await axiosInstance.get<BitbucketDetailedCommit>(
      `/repositories/${config.BITBUCKET_WORKSPACE}/${repository_name}/commit/${commit_hash}`
    );

    const commit = response.data;
    const commitDetails = `**Commit Details: ${commit.hash}**
- Author: ${commit.author.user?.display_name || commit.author.raw}
- Date: ${new Date(commit.date).toLocaleString()}
- Message: ${commit.message}
- Parents: ${commit.parents.map(p => p.hash).join(', ')}`;

    return {
      content: [
        {
          type: 'text',
          text: commitDetails,
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching commit:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching commit: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
    };
  }
} 
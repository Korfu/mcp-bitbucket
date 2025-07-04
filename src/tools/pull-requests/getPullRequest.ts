import { AxiosInstance } from 'axios';
import { Config, PullRequest } from '../../types';

export const getPullRequestTool = {
  name: 'get_pull_request',
  description: 'Get a single pull request by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      repository_name: {
        type: 'string',
        description: 'Name of the repository (repo slug)',
      },
      pull_request_id: {
        type: 'string',
        description: 'The ID of the pull request.',
      },
    },
    required: ['repository_name', 'pull_request_id'],
  },
};

export async function getPullRequest(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const { repository_name, pull_request_id } = args;

    if (!repository_name) {
      throw new Error('Repository name is required');
    }
    if (!pull_request_id) {
      throw new Error('Pull request ID is required');
    }

    console.error(
      `Fetching pull request ${pull_request_id} for repository: ${repository_name}`
    );

    const response = await axiosInstance.get<PullRequest>(
      `/repositories/${config.BITBUCKET_WORKSPACE}/${repository_name}/pullrequests/${pull_request_id}`
    );

    const pr = response.data;
    const prDetails = `**PR #${pr.id}: ${pr.title}**
- State: ${pr.state}
- Author: ${pr.author.display_name}
- Source: ${pr.source.branch.name}
- Destination: ${pr.destination.branch.name}
- Description: ${pr.description}
- URL: ${pr.links.html.href}`;

    return {
      content: [
        {
          type: 'text',
          text: prDetails,
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching pull request:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching pull request: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
    };
  }
} 
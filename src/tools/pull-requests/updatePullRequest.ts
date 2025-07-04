import { AxiosInstance } from 'axios';
import { Config, PullRequest } from '../../types';

export const updatePullRequestTool = {
  name: 'update_pull_request',
  description: 'Update an existing pull request.',
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
      title: {
        type: 'string',
        description: 'The new title of the pull request.',
      },
      description: {
        type: 'string',
        description: 'The new description of the pull request.',
      },
    },
    required: ['repository_name', 'pull_request_id'],
  },
};

export async function updatePullRequest(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const { repository_name, pull_request_id, title, description } = args;

    if (!repository_name || !pull_request_id) {
      throw new Error('Repository name and pull request ID are required');
    }

    console.error(
      `Updating pull request ${pull_request_id} in repository: ${repository_name}`
    );

    const response = await axiosInstance.put<PullRequest>(
      `/repositories/${config.BITBUCKET_WORKSPACE}/${repository_name}/pullrequests/${pull_request_id}`,
      {
        title,
        description,
      }
    );

    const pr = response.data;
    const prDetails = `**Successfully updated PR #${pr.id}: ${pr.title}**
- State: ${pr.state}
- Author: ${pr.author.display_name}
- Source: ${pr.source.branch.name}
- Destination: ${pr.destination.branch.name}
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
    console.error('Error updating pull request:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error updating pull request: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
    };
  }
} 
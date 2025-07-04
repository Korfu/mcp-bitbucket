import { AxiosInstance } from 'axios';
import { Config, PullRequest } from '../../types';

export const createPullRequestTool = {
  name: 'create_pull_request',
  description: 'Create a new pull request.',
  inputSchema: {
    type: 'object',
    properties: {
      repository_name: {
        type: 'string',
        description: 'Name of the repository (repo slug)',
      },
      title: {
        type: 'string',
        description: 'The title of the pull request.',
      },
      source_branch: {
        type: 'string',
        description: 'The source branch of the pull request.',
      },
      destination_branch: {
        type: 'string',
        description: 'The destination branch of the pull request.',
      },
      description: {
        type: 'string',
        description: 'The description of the pull request.',
      },
    },
    required: ['repository_name', 'title', 'source_branch'],
  },
};

export async function createPullRequest(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const {
      repository_name,
      title,
      source_branch,
      destination_branch,
      description,
    } = args;

    if (!repository_name || !title || !source_branch) {
      throw new Error(
        'Repository name, title, and source branch are required'
      );
    }

    console.error(`Creating pull request in repository: ${repository_name}`);

    const response = await axiosInstance.post<PullRequest>(
      `/repositories/${config.BITBUCKET_WORKSPACE}/${repository_name}/pullrequests`,
      {
        title: title,
        source: {
          branch: {
            name: source_branch,
          },
        },
        destination: {
          branch: {
            name: destination_branch,
          },
        },
        description: description,
      }
    );

    const pr = response.data;
    const prDetails = `**Successfully created PR #${pr.id}: ${pr.title}**
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
    console.error('Error creating pull request:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error creating pull request: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
    };
  }
} 
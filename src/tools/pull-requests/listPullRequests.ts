import { AxiosInstance } from 'axios';
import {
  Config,
  BitbucketPaginatedResponse,
  PullRequest,
} from '../../types';

export const listPullRequestsTool = {
  name: 'list_pull_requests',
  description: 'List all pull requests in a repository.',
  inputSchema: {
    type: 'object',
    properties: {
      repository_name: {
        type: 'string',
        description: 'Name of the repository (repo slug)',
      },
      state: {
        type: 'string',
        description: 'The state of the pull request.',
        enum: ['OPEN', 'MERGED', 'DECLINED'],
      },
    },
    required: ['repository_name'],
  },
};

export async function listPullRequests(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const { repository_name, state } = args;

    if (!repository_name) {
      throw new Error('Repository name is required');
    }

    console.error(`Fetching pull requests for repository: ${repository_name}`);

    const response = await axiosInstance.get<
      BitbucketPaginatedResponse<PullRequest>
    >(
      `/repositories/${config.BITBUCKET_WORKSPACE}/${repository_name}/pullrequests`,
      {
        params: {
          state: state,
        },
      }
    );

    const pullRequests = response.data.values;
    const summary = `Found ${
      pullRequests.length
    } pull requests in repository "${repository_name}" ${
      state ? `with state ${state}` : ''
    }`;

    const prList = pullRequests
      .map(
        pr => `**PR #${pr.id}: ${pr.title}**
- State: ${pr.state}
- Author: ${pr.author.display_name}
- Source: ${pr.source.branch.name}
- Destination: ${pr.destination.branch.name}
- URL: ${pr.links.html.href}`
      )
      .join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `${summary}\n\n${prList}`,
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching pull requests: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
    };
  }
} 
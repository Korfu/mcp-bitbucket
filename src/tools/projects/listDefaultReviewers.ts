import { AxiosInstance } from 'axios';
import {
  Config,
  BitbucketPaginatedResponse,
  BitbucketUser,
} from '../../types';

export const listDefaultReviewersTool = {
  name: 'list_default_reviewers',
  description: 'List default reviewers for a project.',
  inputSchema: {
    type: 'object',
    properties: {
      project_key: {
        type: 'string',
        description: 'The key of the project.',
      },
    },
    required: ['project_key'],
  },
};

export async function listDefaultReviewers(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const { project_key } = args;

    if (!project_key) {
      throw new Error('Project key is required');
    }

    console.error(`Fetching default reviewers for project: ${project_key}`);

    const response = await axiosInstance.get<
      BitbucketPaginatedResponse<BitbucketUser>
    >(
      `/workspaces/${config.BITBUCKET_WORKSPACE}/projects/${project_key}/default-reviewers`
    );

    const reviewers = response.data.values;
    const summary = `Found ${reviewers.length} default reviewers in project "${project_key}"`;

    const reviewerList = reviewers
      .map(reviewer => `- ${reviewer.display_name} (${reviewer.nickname})`)
      .join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `${summary}\n\n${reviewerList}`,
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching default reviewers:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching default reviewers: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
    };
  }
} 
import { AxiosInstance } from 'axios';
import { Config, BranchRestriction } from '../../types';

export const getBranchRestrictionTool = {
  name: 'get_branch_restriction',
  description: 'Get a single branch restriction by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      repository_name: {
        type: 'string',
        description: 'Name of the repository (repo slug)',
      },
      restriction_id: {
        type: 'string',
        description: 'The ID of the branch restriction.',
      },
    },
    required: ['repository_name', 'restriction_id'],
  },
};

export async function getBranchRestriction(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const { repository_name, restriction_id } = args;

    if (!repository_name) {
      throw new Error('Repository name is required');
    }
    if (!restriction_id) {
      throw new Error('Restriction ID is required');
    }

    console.error(
      `Fetching branch restriction ${restriction_id} for repository: ${repository_name}`
    );

    const response = await axiosInstance.get<BranchRestriction>(
      `/repositories/${config.BITBUCKET_WORKSPACE}/${repository_name}/branch-restrictions/${restriction_id}`
    );

    const restriction = response.data;
    const restrictionDetails = `**Restriction Details: ${restriction.id}**
- Kind: ${restriction.kind}
- Pattern: ${restriction.pattern}
- Users: ${
      restriction.users
        ? restriction.users.map(u => u.display_name).join(', ')
        : 'None'
    }
- Groups: ${
      restriction.groups
        ? restriction.groups.map(g => g.name).join(', ')
        : 'None'
    }`;

    return {
      content: [
        {
          type: 'text',
          text: restrictionDetails,
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching branch restriction:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching branch restriction: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
    };
  }
} 
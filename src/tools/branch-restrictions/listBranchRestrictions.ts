import { AxiosInstance } from 'axios';
import {
  Config,
  BitbucketPaginatedResponse,
  BranchRestriction,
} from '../../types';

export const listBranchRestrictionsTool = {
  name: 'list_branch_restrictions',
  description: 'List all branch restrictions for a repository.',
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

export async function listBranchRestrictions(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const { repository_name } = args;

    if (!repository_name) {
      throw new Error('Repository name is required');
    }

    console.error(
      `Fetching branch restrictions for repository: ${repository_name}`
    );

    const response = await axiosInstance.get<
      BitbucketPaginatedResponse<BranchRestriction>
    >(
      `/repositories/${config.BITBUCKET_WORKSPACE}/${repository_name}/branch-restrictions`
    );

    const restrictions = response.data.values;
    const summary = `Found ${restrictions.length} branch restrictions in repository "${repository_name}"`;

    const restrictionList = restrictions
      .map(
        restriction => `**Restriction ${restriction.id}**
- Kind: ${restriction.kind}
- Pattern: ${restriction.pattern}`
      )
      .join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `${summary}\n\n${restrictionList}`,
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching branch restrictions:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching branch restrictions: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
    };
  }
} 
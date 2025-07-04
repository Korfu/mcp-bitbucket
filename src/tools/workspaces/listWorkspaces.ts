import { AxiosInstance } from 'axios';
import {
  BitbucketPaginatedResponse,
  BitbucketWorkspace,
  Config,
} from '../../types';

export const listWorkspacesTool = {
  name: 'list_workspaces',
  description: 'List all workspaces accessible by the current user.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function listWorkspaces(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const response = await axiosInstance.get<
      BitbucketPaginatedResponse<BitbucketWorkspace>
    >(`/workspaces`);

    const workspaces = response.data.values;
    const summary = `Found ${workspaces.length} workspaces.`;

    const workspaceList = workspaces
      .map(
        workspace => `**${workspace.name}**
- Slug: ${workspace.slug}
- Private: ${workspace.is_private}`
      )
      .join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `${summary}\n\n${workspaceList}`,
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching workspaces: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
    };
  }
} 
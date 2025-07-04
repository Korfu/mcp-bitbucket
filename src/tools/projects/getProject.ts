import { AxiosInstance } from 'axios';
import { Config, BitbucketProject } from '../../types';

export const getProjectTool = {
  name: 'get_project',
  description: 'Get a single project by its key.',
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

export async function getProject(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const { project_key } = args;

    if (!project_key) {
      throw new Error('Project key is required');
    }

    console.error(`Fetching project: ${project_key}`);

    const response = await axiosInstance.get<BitbucketProject>(
      `/workspaces/${config.BITBUCKET_WORKSPACE}/projects/${project_key}`
    );

    const project = response.data;
    const projectDetails = `**Project Details: ${project.name}**
- Key: ${project.key}
- Description: ${project.description || 'No description'}
- Private: ${project.is_private}
- Created: ${new Date(project.created_on).toLocaleDateString()}
- Updated: ${new Date(project.updated_on).toLocaleDateString()}
- URL: ${project.links.html.href}`;

    return {
      content: [
        {
          type: 'text',
          text: projectDetails,
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching project: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
    };
  }
} 
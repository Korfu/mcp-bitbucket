import { AxiosInstance } from 'axios';
import { Config, BranchingModelSettings } from '../../types';

export const updateProjectBranchingModelSettingsTool = {
  name: 'update_project_branching_model_settings',
  description: 'Update the branching model configuration for a project.',
  inputSchema: {
    type: 'object',
    properties: {
      project_key: {
        type: 'string',
        description: 'The key of the project.',
      },
      settings: {
        type: 'object',
        description:
          'The branching model settings to update. Only passed properties will be updated. See Bitbucket API for details.',
        properties: {
          development: {
            type: 'object',
            properties: {
              use_mainbranch: { type: 'boolean' },
              name: { type: 'string' },
            },
          },
          production: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
              use_mainbranch: { type: 'boolean' },
              name: { type: 'string' },
            },
          },
          branch_types: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                kind: {
                  type: 'string',
                  enum: ['release', 'hotfix', 'feature', 'bugfix'],
                },
                enabled: { type: 'boolean' },
                prefix: { type: 'string' },
              },
              required: ['kind'],
            },
          },
        },
      },
    },
    required: ['project_key', 'settings'],
  },
};

export async function updateProjectBranchingModelSettings(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const projectKey = args?.project_key;
    const settings = args?.settings as BranchingModelSettings;

    if (!projectKey) {
      throw new Error('Project key is required');
    }
    if (!settings) {
      throw new Error('Settings object is required');
    }

    console.error(`Updating branching model for project: ${projectKey}`);

    const response = await axiosInstance.put(
      `/workspaces/${config.BITBUCKET_WORKSPACE}/projects/${projectKey}/branching-model/settings`,
      settings
    );

    return {
      content: [
        {
          type: 'text',
          text: `Successfully updated branching model settings for project "${projectKey}".\n\n${JSON.stringify(
            response.data,
            null,
            2
          )}`,
        },
      ],
    };
  } catch (error) {
    console.error('Error updating project branching model settings:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error updating project branching model settings: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
    };
  }
} 
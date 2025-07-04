import { AxiosInstance } from 'axios';
import { Config, BranchingModelSettings } from '../../types';

export const updateRepositoryBranchingModelSettingsTool = {
  name: 'update_repository_branching_model_settings',
  description: 'Update the branching model configuration for a repository.',
  inputSchema: {
    type: 'object',
    properties: {
      repository_name: {
        type: 'string',
        description: 'Name of the repository (repo slug)',
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
    required: ['repository_name', 'settings'],
  },
};

export async function updateRepositoryBranchingModelSettings(
  axiosInstance: AxiosInstance,
  config: Config,
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const repositoryName = args?.repository_name;
    const settings = args?.settings as BranchingModelSettings;

    if (!repositoryName) {
      throw new Error('Repository name is required');
    }
    if (!settings) {
      throw new Error('Settings object is required');
    }

    console.error(
      `Updating branching model for repository: ${repositoryName}`
    );

    const response = await axiosInstance.put(
      `/repositories/${config.BITBUCKET_WORKSPACE}/${repositoryName}/branching-model/settings`,
      settings
    );

    return {
      content: [
        {
          type: 'text',
          text: `Successfully updated branching model settings for repository "${repositoryName}".\n\n${JSON.stringify(
            response.data,
            null,
            2
          )}`,
        },
      ],
    };
  } catch (error) {
    console.error('Error updating repository branching model settings:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error updating repository branching model settings: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      ],
    };
  }
} 
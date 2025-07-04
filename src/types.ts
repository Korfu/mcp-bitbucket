import { z } from 'zod';

// Environment variables validation
export const ConfigSchema = z.object({
  BITBUCKET_USERNAME: z.string().min(1, 'Bitbucket username is required'),
  BITBUCKET_APP_PASSWORD: z.string().min(1, 'Bitbucket app password is required'),
  BITBUCKET_WORKSPACE: z.string().min(1, 'Bitbucket workspace is required'),
});

export type Config = z.infer<typeof ConfigSchema>;

// Bitbucket API types
export interface BitbucketRepository {
  name: string;
  full_name: string;
  description?: string;
  created_on: string;
  updated_on: string;
  language?: string;
  size: number;
  is_private: boolean;
  links: {
    html: {
      href: string;
    };
  };
}

export interface BitbucketCommit {
  hash: string;
  date: string;
  message: string;
  author: {
    raw: string;
    user?: {
      display_name: string;
    };
  };
}

export interface BitbucketPaginatedResponse<T> {
  values: T[];
  page?: number;
  pagelen?: number;
  size?: number;
  next?: string;
}

export interface RepositoryWithCommitInfo extends BitbucketRepository {
  commit_count?: number;
  latest_commit_date?: string;
  latest_commit_hash?: string;
  latest_commit_message?: string;
  latest_commit_author?: string;
}

export interface BranchingModelSettingsBranch {
  enabled?: boolean;
  name?: string | null;
  use_mainbranch?: boolean;
}

export interface BranchingModelSettingsBranchType {
  kind: 'release' | 'hotfix' | 'feature' | 'bugfix';
  enabled?: boolean;
  prefix?: string;
}

export interface BranchingModelSettings {
  development?: BranchingModelSettingsBranch;
  production?: BranchingModelSettingsBranch;
  branch_types?: BranchingModelSettingsBranchType[];
} 
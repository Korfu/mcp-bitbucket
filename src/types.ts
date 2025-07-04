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

export interface BitbucketUser {
  display_name: string;
  uuid: string;
  nickname: string;
  account_id: string;
}

export interface BitbucketDetailedCommit extends BitbucketCommit {
  parents: {
    hash: string;
    type: string;
  }[];
  author: {
    raw: string;
    user?: BitbucketUser;
  };
  committer: {
    raw: string;
    user?: BitbucketUser;
  };
}

export interface BranchRestriction {
  id: number;
  kind: string;
  pattern: string;
  users: BitbucketUser[] | null;
  groups: any[] | null;
  links: {
    self: {
      href: string;
    };
  };
}

export interface BitbucketProject {
  key: string;
  name: string;
  description?: string;
  is_private: boolean;
  created_on: string;
  updated_on: string;
  links: {
    html: {
      href: string;
    };
  };
}

export interface PullRequest {
  id: number;
  title: string;
  description: string;
  state: 'OPEN' | 'MERGED' | 'DECLINED';
  author: BitbucketUser;
  source: {
    branch: {
      name: string;
    };
  };
  destination: {
    branch: {
      name: string;
    };
  };
  created_on: string;
  updated_on: string;
  links: {
    html: {
      href: string;
    };
  };
}

export interface BitbucketWorkspace {
  uuid: string;
  name: string;
  slug: string;
  is_private: boolean;
  created_on: string;
  updated_on: string;
} 
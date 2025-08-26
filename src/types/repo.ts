export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  open_issues_count: number;
  forks_count: number;
  thumbnail?: string | null;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  license: {
    name: string;
    spdx_id: string;
  } | null;
}

export interface RepoFilter {
  technology: string[];
  popularity: {
    min: number;
    max: number;
  };
  language: string[];
  author: string[];
  license: string[];
  topics: string[];
  hasHomepage: boolean | null;
  isForked: boolean | null;
  health: 'excellent' | 'good' | 'fair' | 'poor' | null;
  size: {
    min: number; // in KB
    max: number; // in KB
  };
  dateRange: {
    createdAfter: Date | null;
    createdBefore: Date | null;
    updatedAfter: Date | null;
    updatedBefore: Date | null;
  };
  minIssues: number | null;
  maxIssues: number | null;
}

export interface SearchFilters {
  query: string;
  filters: RepoFilter;
}
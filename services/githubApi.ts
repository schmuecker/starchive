const GITHUB_API_BASE = "https://api.github.com";

export interface GitHubApiRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  thumbnail?: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
  license: {
    name: string;
    spdx_id: string;
  } | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  open_issues_count: number;
  forks_count: number;
}

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public rateLimitRemaining?: number,
    public rateLimitReset?: number
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

// Note: Client-side GitHub API functions are no longer used
// All GitHub API requests are now handled server-side with ISR
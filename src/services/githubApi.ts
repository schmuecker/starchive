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

import { db } from './database';

export const fetchUserStars = async (username: string, page = 1, perPage = 100): Promise<{
  repos: GitHubApiRepo[];
  hasMore: boolean;
  rateLimitInfo: {
    remaining: number;
    reset: number;
  };
}> => {
  // Check cache first
  const now = Date.now();
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  
  try {
    const cachedData = await db.cachedStars.where('username').equals(username).first();
    
    if (cachedData) {
      const isValidCache = now - cachedData.timestamp < CACHE_DURATION;
      if (isValidCache) {
        return {
          repos: cachedData.repos || [],
          hasMore: false,
          rateLimitInfo: cachedData.rateLimitInfo || { remaining: 0, reset: 0 },
        };
      }
    }
  } catch (error) {
    console.warn('Failed to read from cache:', error);
  }

  const token = localStorage.getItem("github_token");
  
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github.v3+json",
  };

  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  try {
    // Fetch all pages at once for better caching
    let allRepos: GitHubApiRepo[] = [];
    let currentPage = 1;
    let hasMore = true;
    let rateLimitInfo = { remaining: 0, reset: 0 };

    while (hasMore && currentPage <= 10) { // Limit to 1000 repos max
      const response = await fetch(
        `${GITHUB_API_BASE}/users/${username}/starred?page=${currentPage}&per_page=100`,
        { headers }
      );

      rateLimitInfo.remaining = parseInt(response.headers.get("X-RateLimit-Remaining") || "0");
      rateLimitInfo.reset = parseInt(response.headers.get("X-RateLimit-Reset") || "0");

      if (!response.ok) {
        throw new GitHubApiError(
          `GitHub API error: ${response.status} ${response.statusText}`,
          response.status,
          rateLimitInfo.remaining,
          rateLimitInfo.reset
        );
      }

      const repos: GitHubApiRepo[] = await response.json();
      allRepos = [...allRepos, ...repos];
      
      // Check if there are more pages
      const linkHeader = response.headers.get("Link");
      hasMore = linkHeader ? linkHeader.includes('rel="next"') : false;
      currentPage++;

      if (repos.length < 100) {
        hasMore = false; // If we get less than requested, we're at the end
      }

      // Small delay between requests
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Cache the complete result
    try {
      await db.cachedStars.put({
        username,
        repos: allRepos,
        rateLimitInfo,
        timestamp: now,
      });
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }

    // Return paginated result for the requested page
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedRepos = allRepos.slice(startIndex, endIndex);

    return {
      repos: paginatedRepos,
      hasMore: endIndex < allRepos.length,
      rateLimitInfo,
    };
  } catch (error) {
    if (error instanceof GitHubApiError) {
      throw error;
    }
    throw new GitHubApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const extractImageFromReadme = async (repoFullName: string, token?: string): Promise<string | null> => {
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github.v3+json",
  };

  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  try {
    // First try README.md, then README, then readme.md
    const readmeFiles = ['README.md', 'README', 'readme.md', 'Readme.md'];
    
    for (const filename of readmeFiles) {
      try {
        const response = await fetch(
          `${GITHUB_API_BASE}/repos/${repoFullName}/contents/${filename}`,
          { headers }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            const content = atob(data.content);
            
            // Extract images from markdown, excluding badges/shields
            const imageRegex = /!\[.*?\]\((.*?)\)|<img[^>]+src=["']([^"']+)["']/g;
            const badgePatterns = [
              /img\.shields\.io/,
              /shields\.io/,
              /github\.com\/.*\/actions\/workflows.*\/badge\.svg/,
              /github\.com\/.*\/workflows\/.*\/badge\.svg/,
              /travis-ci\.(org|com)/,
              /circleci\.com/,
              /codecov\.io/,
              /app\.codacy\.com/,
              /sonarcloud\.io/,
              /badge\.fury\.io/,
              /api\.codeclimate\.com/,
              /snyk\.io/,
              /img\.badgesize\.io/,
              /dependabot\.com/,
              /renovatebot\.com/,
              /nodei\.co/,
              /david-dm\.org/,
              /badgen\.net/,
              /flat\.badgen\.net/,
              /github\.com\/.*\/badge/,
              /gitpod\.io\/button/,
              /codesandbox\.io/,
              /stackblitz\.com/,
              /npmjs\.com\/package/,
              /npmjs\.org\/package/,
              /pypi\.org\/project/,
              /badge\.svg$/,
              /\/badge\./,
              /CI\.svg$/i,
              /build\.svg$/i,
              /test\.svg$/i,
              /coverage\.svg$/i,
              /status\.svg$/i,
              /\.svg.*badge/i,
              /badge.*\.svg/i,
              /\.png.*badge/i,
              /badge.*\.png/i
            ];
            
            let match;
            while ((match = imageRegex.exec(content)) !== null) {
              let imageUrl = match[1] || match[2];
              
              if (!imageUrl) continue;
              
              // Check if this is a badge/shield URL
              const isBadge = badgePatterns.some(pattern => pattern.test(imageUrl));
              if (isBadge) continue;
              
              // Convert relative URLs to absolute URLs
              if (!imageUrl.startsWith('http')) {
                if (imageUrl.startsWith('./')) {
                  imageUrl = imageUrl.substring(2);
                }
                if (imageUrl.startsWith('/')) {
                  imageUrl = imageUrl.substring(1);
                }
                imageUrl = `https://raw.githubusercontent.com/${repoFullName}/main/${imageUrl}`;
              }
              
              return imageUrl;
            }
          }
          break;
        }
      } catch (error) {
        // Continue to next filename
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.warn(`Failed to fetch README for ${repoFullName}:`, error);
    return null;
  }
};

export const setGitHubToken = (token: string) => {
  if (token.trim()) {
    localStorage.setItem("github_token", token.trim());
  } else {
    localStorage.removeItem("github_token");
  }
};

export const getGitHubToken = (): string | null => {
  return localStorage.getItem("github_token");
};

export const clearStarsCache = async (username: string) => {
  try {
    await db.cachedStars.where('username').equals(username).delete();
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
};
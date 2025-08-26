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

export interface GitHubUser {
  login: string;
  name: string;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  location: string | null;
  blog: string | null;
  company: string | null;
  created_at: string;
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

export const fetchUserProfileServer = async (username: string): Promise<GitHubUser> => {
  const token = process.env.GITHUB_TOKEN;
  
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "Starchive/1.0",
  };

  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/users/${username}`,
      { 
        headers,
        cache: 'force-cache'
      }
    );

    if (!response.ok) {
      throw new GitHubApiError(
        `GitHub API error: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const user: GitHubUser = await response.json();
    return user;
  } catch (error) {
    if (error instanceof GitHubApiError) {
      throw error;
    }
    throw new GitHubApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const fetchUserStarsServer = async (username: string): Promise<{
  repos: GitHubApiRepo[];
  user: GitHubUser;
  rateLimitInfo: {
    remaining: number;
    reset: number;
  };
}> => {
  const token = process.env.GITHUB_TOKEN;
  
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "Starchive/1.0",
  };

  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  try {
    let allRepos: GitHubApiRepo[] = [];
    let currentPage = 1;
    let hasMore = true;
    let rateLimitInfo = { remaining: 0, reset: 0 };

    while (hasMore && currentPage <= 10) { // Limit to 1000 repos max
      const response = await fetch(
        `${GITHUB_API_BASE}/users/${username}/starred?page=${currentPage}&per_page=100`,
        { 
          headers,
          cache: 'force-cache'
        }
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
        hasMore = false;
      }
    }

    // Fetch thumbnails for first 20 repos
    const reposWithThumbnails = await Promise.all(
      allRepos.slice(0, 20).map(async (repo, index) => {
        try {
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, index * 100));
          const thumbnail = await extractImageFromReadmeServer(repo.full_name, token);
          return { ...repo, thumbnail };
        } catch (error) {
          console.warn(`Failed to fetch thumbnail for ${repo.full_name}:`, error);
          return repo;
        }
      })
    );

    // Combine repos with thumbnails and remaining repos
    const finalRepos = [
      ...reposWithThumbnails,
      ...allRepos.slice(20)
    ];

    // Fetch user profile data
    const user = await fetchUserProfileServer(username);

    return {
      repos: finalRepos,
      user,
      rateLimitInfo,
    };
  } catch (error) {
    if (error instanceof GitHubApiError) {
      throw error;
    }
    throw new GitHubApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const extractImageFromReadmeServer = async (repoFullName: string, token?: string): Promise<string | null> => {
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "Starchive/1.0",
  };

  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  try {
    const readmeFiles = ['README.md', 'README', 'readme.md', 'Readme.md'];
    
    for (const filename of readmeFiles) {
      try {
        const response = await fetch(
          `${GITHUB_API_BASE}/repos/${repoFullName}/contents/${filename}`,
          { 
            headers,
            cache: 'force-cache'
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            
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
            
            let match: RegExpExecArray | null;
            while ((match = imageRegex.exec(content)) !== null) {
              let imageUrl = match[1] || match[2];
              
              if (!imageUrl) continue;
              
              const isBadge = badgePatterns.some(pattern => pattern.test(imageUrl));
              if (isBadge) continue;
              
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
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.warn(`Failed to fetch README for ${repoFullName}:`, error);
    return null;
  }
};
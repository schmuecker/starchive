import { useState, useEffect, useCallback } from "react";
import { GitHubRepo } from "@/types/repo";
import { fetchUserStars, GitHubApiRepo, GitHubApiError, clearStarsCache, extractImageFromReadme, getGitHubToken } from "@/services/githubApi";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/services/database";

const convertGitHubRepo = (apiRepo: GitHubApiRepo): GitHubRepo => ({
  id: apiRepo.id,
  name: apiRepo.name,
  full_name: apiRepo.full_name,
  description: apiRepo.description,
  html_url: apiRepo.html_url,
  homepage: apiRepo.homepage,
  stargazers_count: apiRepo.stargazers_count,
  language: apiRepo.language,
  topics: apiRepo.topics,
  thumbnail: apiRepo.thumbnail,
  owner: {
    login: apiRepo.owner.login,
    avatar_url: apiRepo.owner.avatar_url,
    html_url: `https://github.com/${apiRepo.owner.login}`,
  },
  license: apiRepo.license ? {
    name: apiRepo.license.name,
    spdx_id: apiRepo.license.spdx_id,
  } : null,
  created_at: apiRepo.created_at,
  updated_at: apiRepo.updated_at,
  pushed_at: apiRepo.pushed_at,
  size: apiRepo.size,
  open_issues_count: apiRepo.open_issues_count,
  forks_count: apiRepo.forks_count,
});

export const useGitHubStars = (username: string) => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number;
    reset: number;
  } | null>(null);
  const { toast } = useToast();

  const fetchStars = useCallback(async (forceRefresh = false) => {
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      // If force refresh, clear cache first
      if (forceRefresh) {
        await clearStarsCache(username);
      }

      // Fetch first page to get all data (cached)
      const result = await fetchUserStars(username, 1, 100);
      
      // Get all cached data
      try {
        const cachedData = await db.cachedStars.where('username').equals(username).first();
        
        if (cachedData && cachedData.repos) {
          const convertedRepos = cachedData.repos.map(convertGitHubRepo);
          setRepos(convertedRepos);
          setRateLimitInfo(cachedData.rateLimitInfo || result.rateLimitInfo);
          
          // Fetch thumbnails in background for repos that don't have them
          fetchThumbnailsInBackground(convertedRepos);
          
          toast({
            title: "Success!",
            description: `Loaded ${convertedRepos.length} starred repositories${forceRefresh ? '' : ' (cached)'}`,
          });
        } else {
          // Fallback to API result if cache fails
          const convertedRepos = result.repos.map(convertGitHubRepo);
          setRepos(convertedRepos);
          setRateLimitInfo(result.rateLimitInfo);
          
          // Fetch thumbnails in background
          fetchThumbnailsInBackground(convertedRepos);
          
          toast({
            title: "Success!",
            description: `Fetched ${convertedRepos.length} starred repositories`,
          });
        }
      } catch (error) {
        console.warn('Failed to read from cache:', error);
        // Fallback to API result
        const convertedRepos = result.repos.map(convertGitHubRepo);
        setRepos(convertedRepos);
        setRateLimitInfo(result.rateLimitInfo);
        
        // Fetch thumbnails in background
        fetchThumbnailsInBackground(convertedRepos);
        
        toast({
          title: "Success!",
          description: `Fetched ${convertedRepos.length} starred repositories`,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof GitHubApiError 
        ? err.message 
        : "Failed to fetch GitHub stars";
      
      setError(errorMessage);
      
      if (err instanceof GitHubApiError && err.status === 403) {
        toast({
          title: "Rate limit exceeded",
          description: "Add a GitHub token to increase rate limits",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [username, toast]);

  const fetchThumbnailsInBackground = async (repoList: GitHubRepo[]) => {
    const token = getGitHubToken();
    const reposNeedingThumbnails = repoList.filter(repo => !repo.thumbnail);
    
    // Fetch thumbnails for first 20 repos to avoid rate limiting
    const reposToFetch = reposNeedingThumbnails.slice(0, 20);
    
    for (const repo of reposToFetch) {
      try {
        const thumbnail = await extractImageFromReadme(repo.full_name, token || undefined);
        if (thumbnail) {
          // Update the repo in state
          setRepos(prevRepos => 
            prevRepos.map(r => 
              r.id === repo.id ? { ...r, thumbnail } : r
            )
          );
          
          // Update cache
          try {
            const cachedData = await db.cachedStars.where('username').equals(username).first();
            if (cachedData && cachedData.repos) {
              const updatedRepos = cachedData.repos.map(r => 
                r.id === repo.id ? { ...r, thumbnail } : r
              );
              await db.cachedStars.update(cachedData.id!, { repos: updatedRepos });
            }
          } catch (error) {
            console.warn('Failed to update cache with thumbnail:', error);
          }
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.warn(`Failed to fetch thumbnail for ${repo.full_name}:`, error);
      }
    }
  };

  useEffect(() => {
    fetchStars();
  }, [fetchStars]);

  return {
    repos,
    loading,
    error,
    rateLimitInfo,
    refetch: () => fetchStars(true), // Force refresh when manually called
  };
};
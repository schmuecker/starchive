import { useState, useMemo, useCallback } from "react";
import { GitHubRepo, RepoFilter } from "@/types/repo";
import { expandSearchTerms } from "@/data/synonymMaps";
import Fuse from "fuse.js";

export const useRepoSearch = (repos: GitHubRepo[] = []) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [filters, setFilters] = useState<RepoFilter>({
    technology: [],
    popularity: { min: 0, max: 200000 },
    language: [],
    author: [],
    license: [],
    topics: [],
    hasHomepage: null,
    isForked: null,
    health: null,
    size: { min: 0, max: 10000 },
    dateRange: {
      createdAfter: null,
      createdBefore: null,
      updatedAfter: null,
      updatedBefore: null,
    },
    minIssues: null,
    maxIssues: null,
  });

  const triggerSearch = useCallback(() => {
    setActiveSearchQuery(searchQuery);
  }, [searchQuery]);

  // Memoize Fuse instance for better performance
  const fuseInstance = useMemo(() => {
    return new Fuse(repos, {
      keys: [
        { name: "name", weight: 0.3 },
        { name: "description", weight: 0.2 },
        { name: "owner.login", weight: 0.1 },
        { name: "topics", weight: 0.2 },
        { name: "language", weight: 0.2 }
      ],
      threshold: 0.3, // More restrictive for better performance
      distance: 50,   // Reduced distance for faster matching
      includeScore: true,
      ignoreLocation: true, // Ignore location for faster search
      findAllMatches: false, // Stop at first match for better performance
    });
  }, [repos]);

  // Helper function to get repo health
  const getRepoHealth = (repo: GitHubRepo): 'excellent' | 'good' | 'fair' | 'poor' => {
    const daysSinceUpdate = Math.floor((Date.now() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceUpdate <= 7) return 'excellent';
    if (daysSinceUpdate <= 30) return 'good';
    if (daysSinceUpdate <= 90) return 'fair';
    return 'poor';
  };

  // Optimized filtering function
  const filteredRepos = useMemo(() => {
    let results = repos;

    // Apply search query with fuzzy matching and synonym expansion
    if (activeSearchQuery.trim()) {
      const expandedTerms = expandSearchTerms(activeSearchQuery);
      const seenIds = new Set<number>();
      let fuzzyMatches: GitHubRepo[] = [];

      // Combine all search terms into one query for better performance
      const allTerms = [activeSearchQuery, ...expandedTerms.filter(term => term !== activeSearchQuery.toLowerCase())];
      
      // Limit expanded terms to avoid performance issues
      const limitedTerms = allTerms.slice(0, 5);
      
      limitedTerms.forEach(term => {
        const termResults = fuseInstance.search(term, { limit: 50 }); // Limit results per term
        termResults.forEach(result => {
          if (!seenIds.has(result.item.id)) {
            seenIds.add(result.item.id);
            fuzzyMatches.push(result.item);
          }
        });
      });

      results = fuzzyMatches;
    }

    // Apply language filter (AND logic - repo must match ALL selected languages)
    if (filters.language.length > 0) {
      results = results.filter(repo => {
        if (!repo.language) return false;
        // For language, we can only have one language per repo, so use includes
        return filters.language.includes(repo.language);
      });
    }

    // Apply technology filter (AND logic - repo must match ALL selected technologies)
    if (filters.technology.length > 0) {
      results = results.filter(repo => {
        const techText = [
          ...repo.topics,
          repo.description || "",
          repo.name
        ].join(" ").toLowerCase();
        
        return filters.technology.every(tech => 
          techText.includes(tech.toLowerCase())
        );
      });
    }

    // Apply author filter (AND logic - for multiple authors, we need repos from ANY author as repos can only have one author)
    if (filters.author.length > 0) {
      results = results.filter(repo =>
        filters.author.includes(repo.owner.login)
      );
    }

    // Apply license filter (AND logic - for multiple licenses, we need repos with ANY license as repos can only have one license)
    if (filters.license.length > 0) {
      results = results.filter(repo => 
        repo.license && filters.license.includes(repo.license.spdx_id)
      );
    }

    // Apply topics filter (AND logic - repo must have ALL selected topics)
    if (filters.topics.length > 0) {
      results = results.filter(repo => 
        filters.topics.every(topic => repo.topics.includes(topic))
      );
    }

    // Apply popularity filter
    results = results.filter(repo =>
      repo.stargazers_count >= filters.popularity.min &&
      repo.stargazers_count <= filters.popularity.max
    );

    // Apply homepage filter
    if (filters.hasHomepage !== null) {
      results = results.filter(repo => 
        filters.hasHomepage ? !!repo.homepage : !repo.homepage
      );
    }

    // Apply fork filter
    if (filters.isForked !== null) {
      results = results.filter(repo => 
        filters.isForked ? repo.full_name.includes('/') : true
      );
    }

    // Apply health filter
    if (filters.health) {
      results = results.filter(repo => getRepoHealth(repo) === filters.health);
    }

    // Apply issues filter
    if (filters.minIssues !== null || filters.maxIssues !== null) {
      results = results.filter(repo => {
        const issues = repo.open_issues_count;
        return (!filters.minIssues || issues >= filters.minIssues) &&
               (!filters.maxIssues || issues <= filters.maxIssues);
      });
    }

    // Apply date range filters
    if (filters.dateRange.createdAfter || filters.dateRange.createdBefore) {
      results = results.filter(repo => {
        const createdDate = new Date(repo.created_at);
        return (!filters.dateRange.createdAfter || createdDate >= filters.dateRange.createdAfter) &&
               (!filters.dateRange.createdBefore || createdDate <= filters.dateRange.createdBefore);
      });
    }

    if (filters.dateRange.updatedAfter || filters.dateRange.updatedBefore) {
      results = results.filter(repo => {
        const updatedDate = new Date(repo.updated_at);
        return (!filters.dateRange.updatedAfter || updatedDate >= filters.dateRange.updatedAfter) &&
               (!filters.dateRange.updatedBefore || updatedDate <= filters.dateRange.updatedBefore);
      });
    }

    return results;
  }, [activeSearchQuery, filters, repos, fuseInstance]);

  // Optimized filter update functions
  const updateFilters = useCallback((newFilters: RepoFilter) => {
    setFilters(newFilters);
  }, []);

  // Get available filter options from data
  const availableLanguages = useMemo(() => 
    [...new Set(repos.map(repo => repo.language).filter(Boolean))].sort()
  , [repos]);

  const availableAuthors = useMemo(() => {
    const authorCounts = repos.reduce((acc, repo) => {
      acc[repo.owner.login] = (acc[repo.owner.login] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(authorCounts)
      .sort((a, b) => authorCounts[b] - authorCounts[a]);
  }, [repos]);

  const availableLicenses = useMemo(() => 
    [...new Set(repos.map(repo => repo.license?.spdx_id).filter(Boolean))].sort()
  , [repos]);

  const availableTopics = useMemo(() => 
    [...new Set(repos.flatMap(repo => repo.topics))].sort()
  , [repos]);

  const availableTopTags = useMemo(() => {
    const topicCounts = repos.reduce((acc, repo) => {
      repo.topics.forEach(topic => {
        acc[topic] = (acc[topic] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic]) => topic);
  }, [repos]);

  const availableTechnologies = useMemo(() => {
    const technologies = new Set<string>();
    const popularTechs = ["React", "Vue", "Angular", "Node.js", "Python", "JavaScript", "TypeScript", 
      "Go", "Rust", "Java", "Docker", "Kubernetes", "GraphQL", "REST API"];
    
    popularTechs.forEach(tech => {
      const hasRepoWithTech = repos.some(repo => {
        const techText = [
          ...repo.topics,
          repo.description || "",
          repo.name
        ].join(" ").toLowerCase();
        
        return techText.includes(tech.toLowerCase()) || 
               (tech === "Node.js" && techText.includes("node")) ||
               (tech === "JavaScript" && (techText.includes("js") || repo.language === "JavaScript")) ||
               (tech === "TypeScript" && (techText.includes("ts") || repo.language === "TypeScript"));
      });
      
      if (hasRepoWithTech) {
        technologies.add(tech);
      }
    });
    
    return Array.from(technologies).sort();
  }, [repos]);

  const clearFilters = useCallback(() => {
    setFilters({
      technology: [],
      popularity: { min: 0, max: 200000 },
      language: [],
      author: [],
      license: [],
      topics: [],
      hasHomepage: null,
      isForked: null,
      health: null,
      size: { min: 0, max: 10000 },
      dateRange: {
        createdAfter: null,
        createdBefore: null,
        updatedAfter: null,
        updatedBefore: null,
      },
      minIssues: null,
      maxIssues: null,
    });
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    triggerSearch,
    filters,
    setFilters: updateFilters,
    filteredRepos,
    clearFilters,
    totalResults: filteredRepos.length,
    isSearching: false,
    availableLanguages,
    availableAuthors,
    availableLicenses,
    availableTopics,
    availableTopTags,
    availableTechnologies,
  };
};
'use client'

import { SearchBar } from "@/components/SearchBar";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { RepoGrid } from "@/components/VirtualizedRepoGrid";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useRepoSearch } from "@/hooks/useRepoSearch";
import { GitHubApiRepo } from "@/lib/github-server";
import { GitHubRepo } from "@/types/repo";
import React, { useState } from "react";

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

interface ClientHomePageProps {
  initialRepos: GitHubApiRepo[];
}

export default function ClientHomePage({ initialRepos }: ClientHomePageProps) {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  
  const repos = initialRepos.map(convertGitHubRepo);
  
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredRepos,
    clearFilters,
    totalResults,
    isSearching,
    availableLanguages,
    availableAuthors,
    availableLicenses,
    availableTopics,
    availableTechnologies
  } = useRepoSearch(repos);

  return (
    <>
      {/* Clean Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="What do you want to build?" 
          repos={filteredRepos} 
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <Button 
          variant={!filters.technology.length ? "default" : "secondary"} 
          size="sm" 
          onClick={() => setFilters({
            ...filters,
            technology: []
          })} 
          className="rounded-full"
        >
          Popular
        </Button>
        {availableTechnologies.map(tech => (
          <Button 
            key={tech}
            variant={filters.technology.includes(tech) ? "default" : "secondary"} 
            size="sm" 
            onClick={() => {
              setFilters({
                ...filters,
                technology: filters.technology.includes(tech) 
                  ? filters.technology.filter(t => t !== tech) 
                  : [...filters.technology, tech]
              });
            }} 
            className="rounded-full"
          >
            {tech}
          </Button>
        ))}
      </div>
      
      {/* More Filters Button */}
      <div className="flex justify-center mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)} 
          className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-3 w-3 mr-1" />
          {isFiltersExpanded ? 'Less filters' : 'More filters'}
        </Button>
      </div>

      {/* Advanced Filters */}
      <div className="mb-8">
        <AdvancedFilterBar 
          filters={filters} 
          onFilterChange={setFilters} 
          onClearFilters={clearFilters} 
          availableLanguages={availableLanguages} 
          availableAuthors={availableAuthors} 
          availableLicenses={availableLicenses} 
          availableTopics={availableTopics} 
          availableTechnologies={availableTechnologies} 
          isExpanded={isFiltersExpanded} 
          setIsExpanded={setIsFiltersExpanded} 
        />
      </div>

      {/* Results */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {`${totalResults} ${totalResults === 1 ? 'tool' : 'tools'}`}
          {isSearching && <span> (searching...)</span>}
        </p>
      </div>

      {/* Content Grid */}
      <RepoGrid repos={filteredRepos} />
    </>
  );
}
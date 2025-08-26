import { SearchBar } from "@/components/SearchBar";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { RepoGrid } from "@/components/VirtualizedRepoGrid";
import { GitHubTokenDialog } from "@/components/GitHubTokenDialog";
import { ProfileCard } from "@/components/ProfileCard";
import { useRepoSearch } from "@/hooks/useRepoSearch";
import { useGitHubStars } from "@/hooks/useGitHubStars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Archive, Star, Sparkles, RefreshCw, AlertCircle, Settings } from "lucide-react";
import React, { useState } from "react";
const Index = () => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const {
    repos,
    loading,
    error,
    rateLimitInfo,
    refetch
  } = useGitHubStars("schmuecker");
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
  return <div className="min-h-screen bg-background">
      {/* Clean Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <Star className="h-4 w-4 text-background" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">Starchive</h1>
            </div>
            <div className="flex items-center gap-3">
              <GitHubTokenDialog onTokenUpdate={refetch} />
              {rateLimitInfo && <Badge variant="outline" className="text-xs">
                  {rateLimitInfo.remaining} left
                </Badge>}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6">
        {/* Profile Card */}
        <div className="pt-8 pb-8">
          <div className="max-w-2xl mx-auto">
            <ProfileCard />
          </div>
        </div>

        <div className="text-center pt-12 pb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Find the Perfect Tools
            <br />
            for Your Next Project
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">These tools and libraries are curated from my personal GitHub stars.
Say what you want to build and find the right technology for it.</p>

          {/* Clean Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="What do you want to build?" repos={filteredRepos} />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Button variant={!filters.technology.length ? "default" : "secondary"} size="sm" onClick={() => setFilters({
            ...filters,
            technology: []
          })} className="rounded-full">
              Popular
            </Button>
            {availableTechnologies.map(tech => <Button key={tech} variant={filters.technology.includes(tech) ? "default" : "secondary"} size="sm" onClick={() => {
            setFilters({
              ...filters,
              technology: filters.technology.includes(tech) ? filters.technology.filter(t => t !== tech) : [...filters.technology, tech]
            });
          }} className="rounded-full">
                {tech}
              </Button>)}
          </div>
          
          {/* More Filters Button */}
          <div className="flex justify-center mb-8">
            <Button variant="ghost" size="sm" onClick={() => setIsFiltersExpanded(!isFiltersExpanded)} className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground">
              <Settings className="h-3 w-3 mr-1" />
              {isFiltersExpanded ? 'Less filters' : 'More filters'}
            </Button>
          </div>

          {/* Advanced Filters */}
          <div className="mb-8">
            <AdvancedFilterBar filters={filters} onFilterChange={setFilters} onClearFilters={clearFilters} availableLanguages={availableLanguages} availableAuthors={availableAuthors} availableLicenses={availableLicenses} availableTopics={availableTopics} availableTechnologies={availableTechnologies} isExpanded={isFiltersExpanded} setIsExpanded={setIsFiltersExpanded} />
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {!loading && `${totalResults} ${totalResults === 1 ? 'tool' : 'tools'}`}
            {isSearching && <span> (searching...)</span>}
          </p>
        </div>

        {/* Error State */}
        {error && <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Failed to load repositories</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
          </div>}

        {/* Content Grid */}
        {loading ? <div className="text-center py-20">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Loading curated tools...</h3>
            <p className="text-muted-foreground">Fetching repositories from GitHub API</p>
          </div> : <RepoGrid repos={filteredRepos} />}
      </main>
    </div>;
};
export default Index;
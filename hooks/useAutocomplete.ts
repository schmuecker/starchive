import { useState, useMemo, useCallback } from "react";
import { GitHubRepo } from "@/types/repo";
import { technologySynonyms } from "@/data/synonymMaps";
import Fuse from "fuse.js";

export interface SuggestionItem {
  value: string;
  type: 'technology' | 'author' | 'language' | 'topic' | 'repo' | 'description';
  source?: string; // Additional context like repo name for description words
}

export const useAutocomplete = (repos: GitHubRepo[]) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    const allTerms: SuggestionItem[] = [];
    
    // Add technology terms
    Object.keys(technologySynonyms).forEach(tech => {
      allTerms.push({ value: tech, type: 'technology' });
    });
    Object.values(technologySynonyms).flat().forEach(syn => {
      allTerms.push({ value: syn, type: 'technology' });
    });
    
    // Add repo-specific terms
    repos.forEach(repo => {
      // Repo names
      allTerms.push({ value: repo.name, type: 'repo' });
      
      // Authors
      allTerms.push({ value: repo.owner.login, type: 'author' });
      
      // Languages
      if (repo.language) {
        allTerms.push({ value: repo.language.toLowerCase(), type: 'language' });
      }
      
      // Topics
      repo.topics.forEach(topic => {
        allTerms.push({ value: topic, type: 'topic' });
      });
      
      // Extract words from description
      if (repo.description) {
        repo.description.toLowerCase()
          .split(/\s+/)
          .filter(word => word.length > 2)
          .forEach(word => {
            allTerms.push({ 
              value: word, 
              type: 'description',
              source: repo.name 
            });
          });
      }
    });
    
    // Remove duplicates while preserving type info
    const uniqueTerms = new Map<string, SuggestionItem>();
    allTerms.forEach(term => {
      const existing = uniqueTerms.get(term.value);
      if (!existing || (existing.type === 'description' && term.type !== 'description')) {
        // Prefer non-description types over description types
        uniqueTerms.set(term.value, term);
      }
    });
    
    return Array.from(uniqueTerms.values()).sort((a, b) => a.value.localeCompare(b.value));
  }, [repos]);

  const fuse = useMemo(() => {
    return new Fuse(suggestions, {
      keys: ['value'],
      threshold: 0.3,
      distance: 100,
    });
  }, [suggestions]);

  const getSuggestions = useCallback((query: string, limit = 5): SuggestionItem[] => {
    if (!query.trim()) return [];
    
    const results = fuse.search(query);
    return results.slice(0, limit).map(result => result.item);
  }, [fuse]);

  return {
    suggestions,
    getSuggestions,
    showSuggestions,
    setShowSuggestions,
  };
};
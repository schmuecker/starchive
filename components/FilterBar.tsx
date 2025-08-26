import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter, Star, Code, User, Globe } from "lucide-react";
import { RepoFilter } from "@/types/repo";

interface FilterBarProps {
  filters: RepoFilter;
  onFilterChange: (filters: RepoFilter) => void;
  onClearFilters: () => void;
}

const POPULAR_LANGUAGES = ["TypeScript", "JavaScript", "Python", "Go", "Rust", "Java"];
const POPULAR_TECHNOLOGIES = ["react", "vue", "angular", "node", "express", "django", "flask"];

export const FilterBar = ({ filters, onFilterChange, onClearFilters }: FilterBarProps) => {
  const toggleLanguage = (language: string) => {
    const newLanguages = filters.language.includes(language)
      ? filters.language.filter(l => l !== language)
      : [...filters.language, language];
    
    onFilterChange({ ...filters, language: newLanguages });
  };

  const toggleTechnology = (tech: string) => {
    const newTech = filters.technology.includes(tech)
      ? filters.technology.filter(t => t !== tech)
      : [...filters.technology, tech];
    
    onFilterChange({ ...filters, technology: newTech });
  };

  const hasActiveFilters = filters.language.length > 0 || filters.technology.length > 0 || filters.author.length > 0;

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Active filters:
          </span>
          {filters.language.map(lang => (
            <Badge key={lang} variant="secondary" className="gap-1">
              <Code className="h-3 w-3" />
              {lang}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleLanguage(lang)}
                className="h-4 w-4 p-0 hover:bg-destructive/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {filters.technology.map(tech => (
            <Badge key={tech} variant="secondary" className="gap-1">
              {tech}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleTechnology(tech)}
                className="h-4 w-4 p-0 hover:bg-destructive/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-destructive"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Languages */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Code className="h-4 w-4" />
            Languages
          </h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_LANGUAGES.map(language => (
              <Button
                key={language}
                variant={filters.language.includes(language) ? "cosmic" : "filter"}
                size="sm"
                onClick={() => toggleLanguage(language)}
                className="text-xs"
              >
                {language}
              </Button>
            ))}
          </div>
        </div>

        {/* Technologies */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Star className="h-4 w-4" />
            Technologies
          </h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TECHNOLOGIES.map(tech => (
              <Button
                key={tech}
                variant={filters.technology.includes(tech) ? "cosmic" : "filter"}
                size="sm"
                onClick={() => toggleTechnology(tech)}
                className="text-xs"
              >
                {tech}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
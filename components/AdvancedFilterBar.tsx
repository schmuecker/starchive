import { motion, AnimatePresence } from "framer-motion";
import { RepoFilter } from "@/types/repo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { 
  X, 
  Filter, 
  Star, 
  Code, 
  User, 
  Heart, 
  Globe,
  GitFork,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  filters: RepoFilter;
  onFilterChange: (filters: RepoFilter) => void;
  onClearFilters: () => void;
  availableLanguages: string[];
  availableAuthors: string[];
  availableLicenses: string[];
  availableTopics: string[];
  availableTechnologies: string[];
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}


const healthOptions = [
  { value: "excellent", label: "Excellent (Updated this week)", color: "bg-green-500" },
  { value: "good", label: "Good (Updated this month)", color: "bg-yellow-500" },
  { value: "fair", label: "Fair (Updated in 3 months)", color: "bg-orange-500" },
  { value: "poor", label: "Poor (Older than 3 months)", color: "bg-red-500" }
];

export const FilterBar = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  availableLanguages,
  availableAuthors,
  availableLicenses,
  availableTopics,
  availableTechnologies,
  isExpanded,
  setIsExpanded
}: FilterBarProps) => {
  

  const updateFilter = <K extends keyof RepoFilter>(key: K, value: RepoFilter[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'technology' | 'language' | 'author' | 'license' | 'topics', value: string) => {
    const current = filters[key] as string[];
    const updated = current.includes(value) 
      ? current.filter(item => item !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const activeFiltersCount = [
    filters.language.length,
    filters.author.length,
    filters.license.length,
    filters.topics.length,
    filters.hasHomepage !== null ? 1 : 0,
    filters.isForked !== null ? 1 : 0,
    filters.health ? 1 : 0,
    filters.minIssues !== null || filters.maxIssues !== null ? 1 : 0,
    filters.dateRange.createdAfter || filters.dateRange.createdBefore ? 1 : 0,
    filters.dateRange.updatedAfter || filters.dateRange.updatedBefore ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-4">
      {/* Advanced Filters - Only show when expanded */}
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="bg-card/30 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                {/* Filter Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Advanced Filters</span>
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="h-5 px-2 text-xs">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="h-8 px-3 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear all
                  </Button>
                </div>
                </div>

                <div className="space-y-6">
                  {/* Technology Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <Code className="h-3 w-3" />
                      Technologies
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      <Button 
                        variant={!filters.technology.length ? "default" : "secondary"} 
                        size="sm" 
                        onClick={() => updateFilter('technology', [])} 
                        className="h-6 px-2 text-xs"
                      >
                        All
                      </Button>
                      {availableTechnologies.map(tech => (
                        <Button 
                          key={tech}
                          variant={filters.technology.includes(tech) ? "default" : "secondary"} 
                          size="sm" 
                          onClick={() => toggleArrayFilter('technology', tech)} 
                          className="h-6 px-2 text-xs"
                        >
                          {tech}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Popularity Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <Star className="h-3 w-3" />
                      GitHub Stars
                    </Label>
                    <div className="px-3 space-y-2">
                      <Slider
                        value={[filters.popularity.min, filters.popularity.max]}
                        onValueChange={([min, max]) => updateFilter('popularity', { min, max })}
                        max={200000}
                        min={0}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{filters.popularity.min.toLocaleString()}</span>
                        <span>{filters.popularity.max.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <Code className="h-3 w-3" />
                      Programming Languages
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {availableLanguages.slice(0, 15).map(language => (
                        <Button
                          key={language}
                          variant={filters.language.includes(language) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleArrayFilter('language', language)}
                          className="h-6 px-2 text-xs"
                        >
                          {language}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Repository Health */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <Heart className="h-3 w-3" />
                      Repository Health
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {healthOptions.map(option => (
                        <Button
                          key={option.value}
                          variant={filters.health === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateFilter('health', filters.health === option.value ? null : option.value as any)}
                          className="h-8 justify-start text-xs"
                        >
                          <div className={cn("w-2 h-2 rounded-full mr-2", option.color)} />
                          {option.label.split(" (")[0]}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Authors */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <User className="h-3 w-3" />
                      Top Authors
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {availableAuthors.slice(0, 12).map(author => (
                        <Button
                          key={author}
                          variant={filters.author.includes(author) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleArrayFilter('author', author)}
                          className="h-6 px-2 text-xs"
                        >
                          @{author}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Repository Features */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      Repository Features
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasHomepage"
                          checked={filters.hasHomepage === true}
                          onCheckedChange={(checked) => 
                            updateFilter('hasHomepage', checked ? true : filters.hasHomepage === true ? null : true)
                          }
                        />
                        <Label htmlFor="hasHomepage" className="text-xs flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Has Website
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isForked"
                          checked={filters.isForked === false}
                          onCheckedChange={(checked) => 
                            updateFilter('isForked', checked ? false : filters.isForked === false ? null : false)
                          }
                        />
                        <Label htmlFor="isForked" className="text-xs flex items-center gap-1">
                          <GitFork className="h-3 w-3" />
                          Original (Not Fork)
                        </Label>
                      </div>
                    </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { FilterBar as AdvancedFilterBar };
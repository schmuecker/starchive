import { useState, useEffect } from "react";
import { Search, Code, User, Hash, Package, FileText, Zap } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useAutocomplete, SuggestionItem } from "@/hooks/useAutocomplete";
import { GitHubRepo } from "@/types/repo";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  repos: GitHubRepo[];
}

const getSuggestionIcon = (type: SuggestionItem['type']) => {
  switch (type) {
    case 'technology':
      return Code;
    case 'author':
      return User;
    case 'language':
      return Zap;
    case 'topic':
      return Hash;
    case 'repo':
      return Package;
    case 'description':
      return FileText;
    default:
      return Search;
  }
};

const getSuggestionLabel = (type: SuggestionItem['type']) => {
  switch (type) {
    case 'technology':
      return 'Technology';
    case 'author':
      return 'Author';
    case 'language':
      return 'Language';
    case 'topic':
      return 'Topic';
    case 'repo':
      return 'Repository';
    case 'description':
      return 'Description';
    default:
      return 'Search';
  }
};

export const SearchBar = ({ value, onChange, onSearch, placeholder = "What do you want to build?", repos }: SearchBarProps) => {
  const [open, setOpen] = useState(false);
  const { getSuggestions } = useAutocomplete(repos);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (value.trim()) {
      const newSuggestions = getSuggestions(value);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [value, getSuggestions]);

  const handleSelect = (suggestion: SuggestionItem) => {
    onChange(suggestion.value);
    setOpen(false);
  };

  // Group suggestions by type for better organization
  const groupedSuggestions = suggestions.reduce((groups, suggestion) => {
    const type = suggestion.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(suggestion);
    return groups;
  }, {} as Record<string, SuggestionItem[]>);

  return (
    <>
      <div className="relative max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <button
            onClick={() => setOpen(true)}
            className="w-full text-left pl-12 pr-16 py-4 text-base bg-background border border-border rounded-lg hover:border-border/80 smooth-transition focus:outline-none focus:ring-2 focus:ring-ring focus:border-border shadow-sm hover:shadow-md"
          >
            <span className={value ? "text-foreground" : "text-muted-foreground"}>
              {value || placeholder}
            </span>
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput 
            placeholder={placeholder}
            value={value}
            onValueChange={onChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && onSearch) {
                onSearch();
                setOpen(false);
              }
            }}
          />
          <CommandList>
            <CommandEmpty>No suggestions found.</CommandEmpty>
            {Object.entries(groupedSuggestions).map(([type, typeSuggestions]) => (
              <CommandGroup key={type} heading={getSuggestionLabel(type as SuggestionItem['type'])}>
                {typeSuggestions.map((suggestion, index) => {
                  const IconComponent = getSuggestionIcon(suggestion.type);
                  return (
                    <CommandItem
                      key={`${type}-${index}`}
                      value={suggestion.value}
                      onSelect={() => handleSelect(suggestion)}
                      className="flex items-center gap-2"
                    >
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                      <span>{suggestion.value}</span>
                      {suggestion.source && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          from {suggestion.source}
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};
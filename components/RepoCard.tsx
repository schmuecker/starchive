import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, GitFork, User } from "lucide-react";
import { GitHubRepo } from "@/types/repo";
import { getOrGenerateRepoThumbnail } from "@/utils/thumbnailGenerator";

interface RepoCardProps {
  repo: GitHubRepo;
  onTagClick?: (tag: string) => void;
}

export const RepoCard = ({ repo, onTagClick }: RepoCardProps) => {
  const formatStars = (stars: number) => {
    if (stars < 100) {
      return "< 100";
    }
    if (stars < 1000) {
      return "< 1k";
    }
    
    // For 1000+, round UP to the next thousand
    const roundedThousands = Math.ceil(stars / 1000);
    return `${roundedThousands}k`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getHealthScore = () => {
    const daysSinceUpdate = Math.floor((Date.now() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceUpdate <= 7) return { score: "Excellent", color: "bg-green-500" };
    if (daysSinceUpdate <= 30) return { score: "Good", color: "bg-yellow-500" };
    if (daysSinceUpdate <= 90) return { score: "Fair", color: "bg-orange-500" };
    return { score: "Poor", color: "bg-red-500" };
  };

  const health = getHealthScore();
  const thumbnailSrc = repo.thumbnail || getOrGenerateRepoThumbnail(repo);

  return (
    <a 
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full no-underline"
    >
      <Card className="group h-full flex flex-col smooth-transition hover:hover-shadow bg-card border border-border/50 overflow-hidden cursor-pointer">
        {/* Thumbnail */}
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted/30 flex-shrink-0">
          <img 
            src={thumbnailSrc} 
            alt={`${repo.name} preview`}
            className="w-full h-full object-cover smooth-transition group-hover:scale-105"
            onError={(e) => {
              // Fallback to generated thumbnail if external image fails
              if (repo.thumbnail && e.currentTarget.src !== getOrGenerateRepoThumbnail(repo)) {
                e.currentTarget.src = getOrGenerateRepoThumbnail(repo);
              }
            }}
          />
        </div>
        
        <CardContent className="p-4 flex flex-col flex-1 justify-between">
          <div className="space-y-3">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary smooth-transition line-clamp-2 flex-1">
                  {repo.name}
                </CardTitle>
                <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs font-medium">{formatStars(repo.stargazers_count)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{repo.owner.login}</span>
              </div>
            </div>

            {/* Description */}
            <CardDescription className="text-xs text-muted-foreground leading-tight line-clamp-2">
              {repo.description || "No description available"}
            </CardDescription>

            {/* Topics */}
            {repo.topics.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {repo.topics.slice(0, 3).map(topic => (
                  <Badge 
                    key={topic} 
                    variant="secondary" 
                    className="text-xs px-2 py-0.5 h-5 flex-shrink-0 cursor-pointer hover:bg-secondary/80 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onTagClick?.(topic);
                    }}
                  >
                    {topic}
                  </Badge>
                ))}
                {repo.topics.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 h-5 flex-shrink-0">
                    +{repo.topics.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Bottom section */}
          <div className="space-y-3 mt-4">
            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                {repo.language && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                    <span className="truncate">{repo.language}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <GitFork className="h-3 w-3 flex-shrink-0" />
                  <span>{repo.forks_count}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${health.color} flex-shrink-0`}></div>
                <span className="text-xs whitespace-nowrap">{formatDate(repo.updated_at)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
};
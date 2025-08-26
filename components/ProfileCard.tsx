import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Github, ExternalLink } from "lucide-react";
import { GitHubUser } from "@/lib/github-server";

interface ProfileCardProps {
  className?: string;
  user: GitHubUser;
}
export const ProfileCard = ({
  className,
  user
}: ProfileCardProps) => {
  return <Card className={`bg-gradient-to-r from-card/50 to-card/30 border-border/50 backdrop-blur-sm ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-border/20">
            <AvatarImage src={user.avatar_url} alt={user.name || user.login} />
            <AvatarFallback>{user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : user.login.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-foreground">{user.name || user.login}</h3>
              <Badge variant="secondary" className="text-xs">
                Curator
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              founder • developer • designer
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{user.followers} followers</span>
              </div>
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
          </div>
          
          <Button variant="outline" size="sm" asChild>
            <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <Github className="h-3 w-3" />
              Follow
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/20">
          <p className="text-xs text-muted-foreground text-balance ">I've always starred cool repos on GitHub, but when I actually need a great library for a project, finding them again is a pain. So I built this—an easy way to surface the gems buried in my stars. Every tool and library here is something that caught my attention, helped me out, or just sparked a bit of curiosity.</p>
        </div>
      </CardContent>
    </Card>;
};
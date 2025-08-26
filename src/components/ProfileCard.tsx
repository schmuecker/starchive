import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Github, ExternalLink } from "lucide-react";
interface ProfileCardProps {
  className?: string;
}
export const ProfileCard = ({
  className
}: ProfileCardProps) => {
  return <Card className={`bg-gradient-to-r from-card/50 to-card/30 border-border/50 backdrop-blur-sm ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-border/20">
            <AvatarImage src="/lovable-uploads/1d8ea4bc-647e-42f6-911f-941b872433a9.png" alt="Tobias Schmuecker" />
            <AvatarFallback>TS</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-foreground">Tobias Schmuecker</h3>
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
                <span>50 followers</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>Munich, Germany</span>
              </div>
            </div>
          </div>
          
          <Button variant="outline" size="sm" asChild>
            <a href="https://github.com/schmuecker" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <Github className="h-3 w-3" />
              Follow
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/20">
          <p className="text-xs text-muted-foreground text-balance ">These are my personally curated GitHub stars – they are tools and libraries I find valuable for building great software or just stuff I find interesting.</p>
        </div>
      </CardContent>
    </Card>;
};
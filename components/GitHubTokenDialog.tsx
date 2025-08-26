'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Key, ExternalLink } from "lucide-react";
// Note: GitHub token management is now server-side only
// This component is kept for UI consistency but doesn't affect server-side rate limits
import { useToast } from "@/hooks/use-toast";

interface GitHubTokenDialogProps {
  onTokenUpdate?: () => void;
}

export const GitHubTokenDialog = ({ onTokenUpdate }: GitHubTokenDialogProps) => {
  const [token, setToken] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const hasToken = false; // Server-side tokens only

  const handleSave = () => {
    setOpen(false);
    setToken("");
    
    toast({
      title: "Note",
      description: "GitHub API requests are now handled server-side with ISR caching",
    });
    
    onTokenUpdate?.();
  };

  const handleRemove = () => {
    setOpen(false);
    
    toast({
      title: "Note", 
      description: "GitHub API requests are now handled server-side with ISR caching",
    });
    
    onTokenUpdate?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={hasToken ? "secondary" : "outline"} size="sm" className="gap-2">
          <Key className="h-4 w-4" />
          {hasToken ? "Update Token" : "Add GitHub Token"}
          {hasToken && <Badge variant="outline" className="ml-1">Active</Badge>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>GitHub Personal Access Token</DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              Add a GitHub token to increase rate limits from 60 to 5,000 requests per hour.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span>Create one at:</span>
              <a 
                href="https://github.com/settings/tokens?scopes=public_repo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                github.com/settings/tokens
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Only "public_repo" scope is needed. Token is stored locally in your browser.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Personal Access Token</Label>
            <Input
              id="token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {hasToken && (
            <Button variant="outline" onClick={handleRemove} className="w-full sm:w-auto">
              Remove Token
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={!token.trim()}
            className="w-full sm:w-auto"
          >
            Save Token
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
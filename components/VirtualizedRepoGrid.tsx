import React, { memo, useState, useEffect } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { RepoCard } from "@/components/RepoCard";
import { GitHubRepo } from "@/types/repo";

interface RepoGridProps {
  repos: GitHubRepo[];
}

export const RepoGrid = memo(({ repos }: RepoGridProps) => {
  const [windowWidth, setWindowWidth] = useState(1200); // Default to desktop width
  const [isClient, setIsClient] = useState(false);
  
  // Set client flag and window width after hydration
  useEffect(() => {
    setIsClient(true);
    setWindowWidth(window.innerWidth);
  }, []);

  // Update window width on resize
  useEffect(() => {
    if (!isClient) return;
    
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);

  // Calculate columns based on current window width
  const columnCount = React.useMemo(() => {
    if (windowWidth < 768) return 1; // mobile
    if (windowWidth < 1024) return 2; // tablet
    if (windowWidth < 1280) return 3; // laptop
    if (windowWidth < 1536) return 4; // desktop
    return 5; // large desktop
  }, [windowWidth]);

  const rowCount = Math.ceil(repos.length / columnCount);

  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 280, // Estimated height per row (card height + gap)
    overscan: 3, // Render 3 extra rows above and below viewport
  });

  if (repos.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
          <span className="text-2xl">🔍</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-foreground">No tools found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find more results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const startIndex = virtualRow.index * columnCount;
        const endIndex = Math.min(startIndex + columnCount, repos.length);
        const rowRepos = repos.slice(startIndex, endIndex);

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
            className="py-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {rowRepos.map((repo) => (
                <div key={repo.id}>
                  <RepoCard repo={repo} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
});

RepoGrid.displayName = "RepoGrid";
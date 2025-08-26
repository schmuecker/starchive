import { ProfileCard } from "@/components/ProfileCard";
import { Star, AlertCircle } from "lucide-react";
import { fetchUserStarsServer } from "@/lib/github-server";
import ClientHomePage from "./client-page";

async function getGitHubData() {
  try {
    const data = await fetchUserStarsServer("schmuecker");
    return data;
  } catch (error) {
    console.error("Failed to fetch GitHub data:", error);
    return {
      repos: [],
      user: {
        login: "schmuecker",
        name: "Tobias Schmuecker", 
        bio: null,
        avatar_url: "/lovable-uploads/1d8ea4bc-647e-42f6-911f-941b872433a9.png",
        html_url: "https://github.com/schmuecker",
        followers: 50,
        following: 0,
        public_repos: 0,
        location: "Munich, Germany",
        blog: null,
        company: null,
        created_at: new Date().toISOString()
      },
      rateLimitInfo: { remaining: 0, reset: 0 },
      error: error instanceof Error ? error.message : "Failed to fetch data"
    };
  }
}

export default async function HomePage() {
  const data = await getGitHubData();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background sticky top-0 z-50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <Star className="h-4 w-4 text-background" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">Starchive</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6">
        {/* Profile Card */}
        <div className="pb-8">
          <div className="max-w-2xl mx-auto">
            <ProfileCard user={data.user} />
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center pt-12 pb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Discover the Right Tools
            <br />
            for Your Next Project
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Starchive surfaces the best from my GitHub stars—tools and libraries chosen for quality and creativity. Describe your project and get matched with tech that fits.
          </p>
        </div>

        {/* Error State */}
        {'error' in data && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Failed to load repositories</p>
              <p className="text-xs text-muted-foreground mt-1">{data.error}</p>
            </div>
          </div>
        )}

        {/* Client-side interactive content */}
        <ClientHomePage initialRepos={data.repos} />
      </main>
    </div>
  );
}

export const revalidate = 600; // ISR: revalidate every 10 minutes
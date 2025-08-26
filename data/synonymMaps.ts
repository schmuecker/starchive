export const technologySynonyms: Record<string, string[]> = {
  "animation": ["motion", "transitions", "animate", "lottie", "framer", "gsap"],
  "ui": ["interface", "components", "design", "styling", "theme"],
  "react": ["jsx", "tsx", "hooks", "component"],
  "vue": ["vuejs", "composition", "options"],
  "angular": ["ng", "typescript", "rxjs"],
  "node": ["nodejs", "server", "backend", "express"],
  "python": ["py", "django", "flask", "fastapi"],
  "machine learning": ["ml", "ai", "tensorflow", "pytorch", "scikit"],
  "database": ["db", "sql", "nosql", "mongodb", "postgres"],
  "api": ["rest", "graphql", "endpoint", "service"],
  "testing": ["test", "jest", "cypress", "vitest", "unit"],
  "build": ["bundler", "webpack", "vite", "rollup", "esbuild"],
  "css": ["styles", "sass", "scss", "less", "tailwind"],
  "mobile": ["ios", "android", "react native", "flutter", "app"],
  "security": ["auth", "authentication", "encryption", "jwt", "oauth"],
  "performance": ["optimization", "speed", "lazy", "cache", "memory"],
  "docs": ["documentation", "readme", "guide", "tutorial"],
  "cli": ["command", "terminal", "tool", "script"],
  "config": ["configuration", "settings", "env", "dotenv"],
  "deploy": ["deployment", "docker", "kubernetes", "ci", "cd"]
};

export const expandSearchTerms = (query: string): string[] => {
  const terms = query.toLowerCase().split(' ');
  const expandedTerms = new Set(terms);
  
  terms.forEach(term => {
    Object.entries(technologySynonyms).forEach(([key, synonyms]) => {
      if (key.includes(term) || synonyms.some(syn => syn.includes(term))) {
        expandedTerms.add(key);
        synonyms.forEach(syn => expandedTerms.add(syn));
      }
    });
  });
  
  return Array.from(expandedTerms);
};
import Dexie, { Table } from 'dexie';
import { GitHubApiRepo } from './githubApi';

export interface CachedStarsData {
  id?: number;
  username: string;
  repos: GitHubApiRepo[];
  rateLimitInfo: {
    remaining: number;
    reset: number;
  };
  timestamp: number;
}

export class GitHubStarsDB extends Dexie {
  cachedStars!: Table<CachedStarsData>;

  constructor() {
    super('GitHubStarsDB');
    this.version(1).stores({
      cachedStars: '++id, username, timestamp'
    });
  }
}

export const db = new GitHubStarsDB();
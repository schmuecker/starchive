interface BundlephobiaResponse {
  name: string;
  size: number;
  gzip: number;
}

interface BundleSizeCache {
  [packageName: string]: {
    size: number;
    timestamp: number;
  };
}

const bundleSizeCache: BundleSizeCache = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getBundleSize(packageName: string): Promise<number | null> {
  // Check cache first
  const cached = bundleSizeCache[packageName];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.size;
  }

  try {
    const response = await fetch(`https://bundlephobia.com/api/size?package=${encodeURIComponent(packageName)}`);
    
    if (!response.ok) {
      return null;
    }

    const data: BundlephobiaResponse = await response.json();
    const sizeInKB = Math.round(data.gzip / 1024);

    // Cache the result
    bundleSizeCache[packageName] = {
      size: sizeInKB,
      timestamp: Date.now()
    };

    return sizeInKB;
  } catch (error) {
    console.warn(`Failed to fetch bundle size for ${packageName}:`, error);
    return null;
  }
}

// Get bundle sizes for multiple packages
export async function getBundleSizes(packageNames: string[]): Promise<Record<string, number | null>> {
  const results: Record<string, number | null> = {};
  
  // Process in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < packageNames.length; i += batchSize) {
    const batch = packageNames.slice(i, i + batchSize);
    
    const promises = batch.map(async (packageName) => {
      const size = await getBundleSize(packageName);
      return { packageName, size };
    });

    const batchResults = await Promise.all(promises);
    
    batchResults.forEach(({ packageName, size }) => {
      results[packageName] = size;
    });

    // Add delay between batches to be nice to the API
    if (i + batchSize < packageNames.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
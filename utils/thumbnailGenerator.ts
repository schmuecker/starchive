import { GitHubRepo } from "@/types/repo";

// Language-specific color palettes
const LANGUAGE_COLORS: Record<string, string[]> = {
  'JavaScript': ['#F7DF1E', '#323330'],
  'TypeScript': ['#3178C6', '#235A97'],
  'Python': ['#3776AB', '#FFD43B'],
  'Java': ['#ED8B00', '#5382A1'],
  'C++': ['#00599C', '#004482'],
  'C': ['#A8B9CC', '#283593'],
  'Go': ['#00ADD8', '#7DD3FC'],
  'Rust': ['#CE422B', '#A72145'],
  'PHP': ['#777BB4', '#4F5B93'],
  'Ruby': ['#CC342D', '#A91401'],
  'Swift': ['#FA7343', '#F05138'],
  'Kotlin': ['#7F52FF', '#0095D5'],
  'Dart': ['#0175C2', '#13B9FD'],
  'HTML': ['#E34F26', '#F06529'],
  'CSS': ['#1572B6', '#33A9DC'],
  'Vue': ['#4FC08D', '#35495E'],
  'React': ['#61DAFB', '#20232A'],
  'Angular': ['#DD0031', '#C3002F'],
  'default': ['#6B7280', '#374151']
};

// Simple hash function for consistent randomness
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Generate deterministic random number between 0 and 1
function seededRandom(seed: number, iteration: number = 0): number {
  const x = Math.sin(seed + iteration * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// Get language colors with fallback
function getLanguageColors(language: string | null): string[] {
  if (!language) return LANGUAGE_COLORS.default;
  return LANGUAGE_COLORS[language] || LANGUAGE_COLORS.default;
}

// Generate geometric pattern based on repo data
function generatePattern(
  ctx: CanvasRenderingContext2D,
  repo: GitHubRepo,
  width: number,
  height: number,
  seed: number
): void {
  const colors = getLanguageColors(repo.language);
  const [primaryColor, secondaryColor] = colors;

  // Background
  ctx.fillStyle = primaryColor + '08';
  ctx.fillRect(0, 0, width, height);

  // Select pattern type based on repo characteristics
  const patternType = Math.floor(seededRandom(seed) * 6);
  const intensity = Math.min(0.3, repo.stargazers_count / 1000 + 0.1);

  switch (patternType) {
    case 0:
      generateGridPattern(ctx, width, height, seed, primaryColor, secondaryColor, intensity);
      break;
    case 1:
      generateDiagonalStripes(ctx, width, height, seed, primaryColor, secondaryColor, intensity);
      break;
    case 2:
      generateDotPattern(ctx, width, height, seed, primaryColor, secondaryColor, intensity);
      break;
    case 3:
      generateWavePattern(ctx, width, height, seed, primaryColor, secondaryColor, intensity);
      break;
    case 4:
      generateConcentricPattern(ctx, width, height, seed, primaryColor, secondaryColor, intensity);
      break;
    case 5:
      generateHexagonPattern(ctx, width, height, seed, primaryColor, secondaryColor, intensity);
      break;
  }
}

// Grid pattern
function generateGridPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  primary: string,
  secondary: string,
  intensity: number
): void {
  const gridSize = 20 + Math.floor(seededRandom(seed, 1) * 20);
  ctx.strokeStyle = primary + Math.floor(intensity * 255).toString(16).padStart(2, '0');
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

// Diagonal stripes
function generateDiagonalStripes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  primary: string,
  secondary: string,
  intensity: number
): void {
  const spacing = 15 + Math.floor(seededRandom(seed, 1) * 25);
  const angle = seededRandom(seed, 2) * Math.PI / 4; // 0 to 45 degrees
  
  ctx.strokeStyle = primary + Math.floor(intensity * 255).toString(16).padStart(2, '0');
  ctx.lineWidth = 2;

  const maxDimension = Math.max(width, height);
  for (let i = -maxDimension; i <= maxDimension * 2; i += spacing) {
    ctx.beginPath();
    ctx.moveTo(i * Math.cos(angle), i * Math.sin(angle));
    ctx.lineTo(
      i * Math.cos(angle) + maxDimension * Math.cos(angle + Math.PI / 2),
      i * Math.sin(angle) + maxDimension * Math.sin(angle + Math.PI / 2)
    );
    ctx.stroke();
  }
}

// Dot pattern
function generateDotPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  primary: string,
  secondary: string,
  intensity: number
): void {
  const spacing = 20 + Math.floor(seededRandom(seed, 1) * 15);
  const radius = 2 + Math.floor(seededRandom(seed, 2) * 4);
  
  ctx.fillStyle = primary + Math.floor(intensity * 255).toString(16).padStart(2, '0');

  for (let x = spacing / 2; x < width; x += spacing) {
    for (let y = spacing / 2; y < height; y += spacing) {
      // Offset every other row for honeycomb effect
      const offsetX = (Math.floor(y / spacing) % 2) * (spacing / 2);
      ctx.beginPath();
      ctx.arc(x + offsetX, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Wave pattern
function generateWavePattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  primary: string,
  secondary: string,
  intensity: number
): void {
  const frequency = 0.02 + seededRandom(seed, 1) * 0.03;
  const amplitude = 10 + seededRandom(seed, 2) * 20;
  const lineSpacing = 20;
  
  ctx.strokeStyle = primary + Math.floor(intensity * 255).toString(16).padStart(2, '0');
  ctx.lineWidth = 2;

  for (let y = 0; y < height; y += lineSpacing) {
    ctx.beginPath();
    for (let x = 0; x <= width; x += 2) {
      const waveY = y + Math.sin(x * frequency + seed) * amplitude;
      if (x === 0) {
        ctx.moveTo(x, waveY);
      } else {
        ctx.lineTo(x, waveY);
      }
    }
    ctx.stroke();
  }
}

// Concentric pattern
function generateConcentricPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  primary: string,
  secondary: string,
  intensity: number
): void {
  const centerX = width / 2 + (seededRandom(seed, 1) - 0.5) * width * 0.3;
  const centerY = height / 2 + (seededRandom(seed, 2) - 0.5) * height * 0.3;
  const spacing = 15 + Math.floor(seededRandom(seed, 3) * 15);
  const maxRadius = Math.max(width, height);
  
  ctx.strokeStyle = primary + Math.floor(intensity * 255).toString(16).padStart(2, '0');
  ctx.lineWidth = 1;

  for (let radius = spacing; radius < maxRadius; radius += spacing) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// Hexagon pattern
function generateHexagonPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  primary: string,
  secondary: string,
  intensity: number
): void {
  const size = 15 + Math.floor(seededRandom(seed, 1) * 10);
  const hexWidth = size * Math.sqrt(3);
  const hexHeight = size * 2;
  
  ctx.strokeStyle = primary + Math.floor(intensity * 255).toString(16).padStart(2, '0');
  ctx.lineWidth = 1;

  for (let row = 0; row < height / hexHeight + 2; row++) {
    for (let col = 0; col < width / hexWidth + 2; col++) {
      const x = col * hexWidth + (row % 2) * (hexWidth / 2);
      const y = row * hexHeight * 0.75;
      
      drawHexagon(ctx, x, y, size);
    }
  }
}

// Helper function to draw hexagon
function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const pointX = x + size * Math.cos(angle);
    const pointY = y + size * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(pointX, pointY);
    } else {
      ctx.lineTo(pointX, pointY);
    }
  }
  ctx.closePath();
  ctx.stroke();
}

// Add text overlay (minimal - no text elements)
function addTextOverlay(
  ctx: CanvasRenderingContext2D,
  repo: GitHubRepo,
  width: number,
  height: number
): void {
  // No text elements - pure pattern-based thumbnails
}

export function generateRepoThumbnail(repo: GitHubRepo): string {
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  // Set dimensions
  const width = 320;
  const height = 240;
  canvas.width = width;
  canvas.height = height;

  // Generate seed from repo data
  const seed = simpleHash(repo.full_name + repo.language + repo.stargazers_count);

  // Generate pattern
  generatePattern(ctx, repo, width, height, seed);
  
  // Add text overlay
  addTextOverlay(ctx, repo, width, height);

  // Convert to data URL
  return canvas.toDataURL('image/png', 0.8);
}

// Memoization for performance
const thumbnailCache = new Map<string, string>();

export function getOrGenerateRepoThumbnail(repo: GitHubRepo): string {
  const cacheKey = `${repo.id}-${repo.stargazers_count}-${repo.language}`;
  
  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey)!;
  }

  const thumbnail = generateRepoThumbnail(repo);
  thumbnailCache.set(cacheKey, thumbnail);
  
  // Limit cache size
  if (thumbnailCache.size > 100) {
    const firstKey = thumbnailCache.keys().next().value;
    thumbnailCache.delete(firstKey);
  }
  
  return thumbnail;
}
export const getAvatarUrl = (path?: string) => {
  if (!path) return undefined;
  if (path.startsWith('http') || path.startsWith('https')) return path;
  // Assuming backend runs on port 3000
  if (path.startsWith('/')) return `http://localhost:3000${path}`;
  return path;
};

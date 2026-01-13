export function sortHistoryByFavorite(records: any[]) {
  return [...records].sort((a, b) => {
    if (a.is_favorite === b.is_favorite) return 0;
    return a.is_favorite ? -1 : 1; 
  });
}
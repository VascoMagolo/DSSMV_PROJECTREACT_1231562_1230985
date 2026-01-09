import { sortHistoryByFavorite } from '../src/domain/history/history.logic';

describe('History Domain Logic', () => {
  it('TC10 - should ensure favorites appear at the top of the list', () => {
    const history = [
      { id: '1', is_favorite: false },
      { id: '2', is_favorite: true },
      { id: '3', is_favorite: false }
    ];
    
    const sorted = sortHistoryByFavorite(history);
    
    expect(sorted[0].id).toBe('2');
    expect(sorted[0].is_favorite).toBe(true);
  });
});
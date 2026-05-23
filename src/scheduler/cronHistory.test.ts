import {
  createHistory,
  addToHistory,
  removeFromHistory,
  getRecentEntries,
  getMostUsed,
  enrichWithNextRun,
} from './cronHistory';

describe('cronHistory', () => {
  describe('createHistory', () => {
    it('creates an empty history with default max size', () => {
      const h = createHistory();
      expect(h.entries).toHaveLength(0);
      expect(h.maxSize).toBe(20);
    });

    it('respects custom max size', () => {
      const h = createHistory(5);
      expect(h.maxSize).toBe(5);
    });
  });

  describe('addToHistory', () => {
    it('adds a new entry', () => {
      const h = addToHistory(createHistory(), '* * * * *', 'every minute');
      expect(h.entries).toHaveLength(1);
      expect(h.entries[0].expression).toBe('* * * * *');
      expect(h.entries[0].label).toBe('every minute');
      expect(h.entries[0].useCount).toBe(1);
    });

    it('increments useCount for duplicate expressions', () => {
      let h = addToHistory(createHistory(), '0 9 * * *');
      h = addToHistory(h, '0 9 * * *');
      expect(h.entries).toHaveLength(1);
      expect(h.entries[0].useCount).toBe(2);
    });

    it('respects maxSize limit', () => {
      let h = createHistory(3);
      h = addToHistory(h, '* * * * *');
      h = addToHistory(h, '0 * * * *');
      h = addToHistory(h, '0 9 * * *');
      h = addToHistory(h, '0 12 * * *');
      expect(h.entries).toHaveLength(3);
    });
  });

  describe('removeFromHistory', () => {
    it('removes an entry by expression', () => {
      let h = addToHistory(createHistory(), '* * * * *');
      h = removeFromHistory(h, '* * * * *');
      expect(h.entries).toHaveLength(0);
    });

    it('does nothing if expression not found', () => {
      let h = addToHistory(createHistory(), '* * * * *');
      h = removeFromHistory(h, '0 9 * * *');
      expect(h.entries).toHaveLength(1);
    });
  });

  describe('getRecentEntries', () => {
    it('returns entries sorted by lastUsed descending', () => {
      let h = createHistory();
      h = addToHistory(h, '* * * * *');
      h = addToHistory(h, '0 9 * * *');
      const recent = getRecentEntries(h, 2);
      expect(recent[0].expression).toBe('0 9 * * *');
    });
  });

  describe('getMostUsed', () => {
    it('returns entries sorted by useCount descending', () => {
      let h = createHistory();
      h = addToHistory(h, '* * * * *');
      h = addToHistory(h, '* * * * *');
      h = addToHistory(h, '0 9 * * *');
      const top = getMostUsed(h, 1);
      expect(top[0].expression).toBe('* * * * *');
      expect(top[0].useCount).toBe(2);
    });
  });

  describe('enrichWithNextRun', () => {
    it('attaches a nextRun date for valid expressions', () => {
      const h = addToHistory(createHistory(), '0 9 * * *');
      const enriched = enrichWithNextRun(h.entries[0]);
      expect(enriched.nextRun).toBeInstanceOf(Date);
    });

    it('returns null nextRun for invalid expressions', () => {
      const h = addToHistory(createHistory(), 'invalid expr');
      const enriched = enrichWithNextRun(h.entries[0]);
      expect(enriched.nextRun).toBeNull();
    });
  });
});

const KEY = 'banana-wheels-v2-save';

const DEFAULT_SAVE = {
  bestScore: 0,
  wallet: 0,
  upgrades: {
    acceleration: 0,
    grip: 0,
    boost: 0,
  },
  options: {
    muted: false,
    reducedMotion: false,
  },
};

export class Storage {
  load() {
    try {
      return { ...DEFAULT_SAVE, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
    } catch {
      return structuredClone(DEFAULT_SAVE);
    }
  }

  save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }
}

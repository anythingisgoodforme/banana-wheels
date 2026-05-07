export const OBSTACLE_KINDS = ['monkey', 'crate', 'oil', 'barrel', 'peel'];

export const PATTERNS = [
  { blocked: [0], cost: 1 },
  { blocked: [1], cost: 1 },
  { blocked: [2], cost: 1 },
  { blocked: [0, 2], cost: 2 },
  { blocked: [0, 1], cost: 3 },
  { blocked: [1, 2], cost: 3 },
];

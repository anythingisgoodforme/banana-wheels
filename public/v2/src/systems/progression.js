export const UPGRADE_DEFS = [
  {
    id: 'acceleration',
    name: 'Acceleration',
    description: 'Reach speed faster after turns and crashes.',
  },
  { id: 'grip', name: 'Grip', description: 'Lane changes settle faster and feel sharper.' },
  { id: 'boost', name: 'Boost Tank', description: 'Start each run with more banana boost energy.' },
];

export function upgradeCost(level) {
  return 18 + level * 22;
}

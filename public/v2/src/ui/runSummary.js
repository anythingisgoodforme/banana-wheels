export function formatCombo(value) {
  return `x${value.toFixed(1)}`;
}

export function formatScore(value) {
  return Math.floor(value).toLocaleString();
}

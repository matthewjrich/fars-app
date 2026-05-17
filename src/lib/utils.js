export const fmt = n => Math.round(n).toLocaleString();
export const fmtD = (n, d = 1) => parseFloat(n).toFixed(d);
export const fmtCurrency = n => '$' + Math.round(n).toLocaleString();
export const safeid = s => s.replace(/[^a-z0-9]/gi, '_');

export function gaugeColor(p) {
  if (p < 30) return '#238636';
  if (p < 60) return '#9e6a03';
  if (p < 85) return '#b34700';
  return '#b31942';
}

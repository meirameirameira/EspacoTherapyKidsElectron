export const showOrDash = (val, decimals = 0) => {
  if (val == null || val === 0) return '—';
  return decimals > 0 ? Number(val).toFixed(decimals) : val;
};

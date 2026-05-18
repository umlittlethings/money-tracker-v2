export const formatMoney = (amount, hideBalance) => {
  if (hideBalance) return '***.***';
  if (amount === undefined || amount === null || isNaN(amount)) return '0';
  return Number(amount).toLocaleString('id-ID');
};

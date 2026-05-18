export const formatMoney = (amount, hideBalance) => {
  if (hideBalance) return '***.***';
  return amount.toLocaleString('id-ID');
};

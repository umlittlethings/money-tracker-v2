export const exportToCSV = (transactions) => {
  const headers = ['Date', 'Wallet', 'Category', 'Note', 'Amount'];
  const rows = transactions.map(t => [
    new Date(t.date).toLocaleDateString('id-ID'),
    t.wallet || 'Cash',
    t.category,
    t.note ? `"${t.note.replace(/"/g, '""')}"` : '', // Escape quotes for CSV
    t.amount
  ]);

  const csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `MoneyTracker_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatMoney } from './format';

export const exportToCSV = (transactions) => {
  const headers = ['Date', 'Wallet', 'Category', 'Note', 'Amount'];
  const rows = transactions.map(t => [
    new Date(t.date).toLocaleDateString('id-ID'),
    t.wallet || 'Cash',
    t.category,
    t.note ? `"${t.note.replace(/"/g, '""')}"` : '', // Escape quotes for CSV
    t.amount
  ]);

  // Gunakan separator titik koma (;) dan BOM (Byte Order Mark) \uFEFF 
  // agar Excel (khususnya region Indonesia) bisa membaca kolom dan karakter dengan benar.
  const csvContent = "\uFEFF" + [headers.join(';'), ...rows.map(e => e.join(';'))].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `MoneyTracker_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = (transactions) => {
  const doc = new jsPDF();
  const tableColumn = ["Date", "Wallet", "Category", "Note", "Amount"];
  const tableRows = [];

  transactions.forEach(t => {
    const transactionData = [
      new Date(t.date).toLocaleDateString('id-ID'),
      t.wallet || 'Cash',
      t.category,
      t.note || '',
      `Rp ${formatMoney(t.amount, false)}`
    ];
    tableRows.push(transactionData);
  });

  doc.text("Money Tracker - Transaction Report", 14, 15);
  doc.text(`Generated on: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 30,
  });

  doc.save(`MoneyTracker_Export_${new Date().toISOString().split('T')[0]}.pdf`);
};

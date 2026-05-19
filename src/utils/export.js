import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatMoney } from './format';

export const exportToCSV = (transactions, wallets = []) => {
  const pengeluaran = transactions.filter(t => t.category !== 'System');
  const systemLogs = transactions.filter(t => t.category === 'System');
  const today = new Date().toLocaleDateString('id-ID');

  let csvRows = [];

  // 1. Header Laporan
  csvRows.push(['Laporan Keuangan & Saldo']);
  csvRows.push([`Tanggal Export: ${today}`]);
  csvRows.push([]);

  // 2. Saldo
  csvRows.push(['Tabel Saldo Saat Ini']);
  csvRows.push(['Dompet', 'Saldo (Rp)']);
  wallets.forEach(w => {
    csvRows.push([w.name, w.balance]);
  });
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  csvRows.push(['TOTAL KESELURUHAN', totalBalance]);
  csvRows.push([]);
  csvRows.push([]);

  // 3. Pengeluaran
  csvRows.push(['Tabel Pengeluaran']);
  csvRows.push(['Tanggal', 'Dompet', 'Kategori', 'Catatan', 'Nominal (Rp)']);
  pengeluaran.forEach(t => {
    csvRows.push([
      new Date(t.date).toLocaleDateString('id-ID'),
      t.wallet || 'Cash',
      t.category,
      t.note ? `"${t.note.replace(/"/g, '""')}"` : '',
      t.amount
    ]);
  });
  csvRows.push([]);
  csvRows.push([]);

  // 4. System Logs
  if (systemLogs.length > 0) {
    csvRows.push(['System Logs (Riwayat Sistem)']);
    csvRows.push(['Tanggal', 'Dompet', 'Kategori', 'Catatan', 'Nominal (Rp)']);
    systemLogs.forEach(t => {
      csvRows.push([
        new Date(t.date).toLocaleDateString('id-ID'),
        t.wallet || 'Cash',
        t.category,
        t.note ? `"${t.note.replace(/"/g, '""')}"` : '',
        t.amount
      ]);
    });
  }

  // Gunakan separator titik koma (;) dan BOM (Byte Order Mark) \uFEFF 
  // agar Excel (khususnya region Indonesia) bisa membaca kolom dan karakter dengan benar.
  const csvContent = "\uFEFF" + csvRows.map(e => e.join(';')).join("\n");
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

export const exportToPDF = (transactions, wallets = []) => {
  const doc = new jsPDF();
  const pengeluaran = transactions.filter(t => t.category !== 'System');
  const systemLogs = transactions.filter(t => t.category === 'System');
  const today = new Date().toLocaleDateString('id-ID');

  doc.setFontSize(14);
  doc.text("Laporan Keuangan & Saldo", 14, 15);
  doc.setFontSize(10);
  doc.text(`Tanggal Export: ${today}`, 14, 22);

  // Table Saldo
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const saldoRows = wallets.map(w => [w.name, `Rp ${formatMoney(w.balance, false)}`]);
  saldoRows.push(['TOTAL KESELURUHAN', `Rp ${formatMoney(totalBalance, false)}`]);

  doc.autoTable({
    head: [['Dompet', 'Saldo Saat Ini']],
    body: saldoRows,
    startY: 28,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } }
  });

  let finalY = doc.lastAutoTable.finalY || 30;

  // Table Pengeluaran
  const tableColumn = ["Tanggal", "Dompet", "Kategori", "Catatan", "Nominal"];
  const tableRows = pengeluaran.map(t => [
    new Date(t.date).toLocaleDateString('id-ID'),
    t.wallet || 'Cash',
    t.category,
    t.note || '',
    `Rp ${formatMoney(t.amount, false)}`
  ]);

  doc.setFontSize(14);
  doc.text("Daftar Pengeluaran", 14, finalY + 12);
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: finalY + 17,
    headStyles: { fillColor: [16, 185, 129] }
  });

  // Page 2: System Logs
  if (systemLogs.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text("System Logs (Riwayat Sistem)", 14, 15);
    
    const sysRows = systemLogs.map(t => [
      new Date(t.date).toLocaleDateString('id-ID'),
      t.wallet || 'Cash',
      t.category,
      t.note || '',
      `Rp ${formatMoney(t.amount, false)}`
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: sysRows,
      startY: 22,
      headStyles: { fillColor: [107, 114, 128] } // Gray for system logs
    });
  }

  doc.save(`MoneyTracker_Export_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = async (transactions, wallets = []) => {
  const workbook = new ExcelJS.Workbook();
  const pengeluaran = transactions.filter(t => t.category !== 'System');
  const systemLogs = transactions.filter(t => t.category === 'System');
  const today = new Date().toLocaleDateString('id-ID');

  // SHEET 1: PENGELUARAN & SALDO
  const worksheet = workbook.addWorksheet('Pengeluaran');

  worksheet.columns = [
    { header: '', key: 'col1', width: 15 },
    { header: '', key: 'col2', width: 25 },
    { header: '', key: 'col3', width: 20 },
    { header: '', key: 'col4', width: 35 },
    { header: '', key: 'col5', width: 20 }
  ];

  worksheet.addRow(['Laporan Keuangan', '']);
  worksheet.getRow(1).font = { bold: true, size: 14 };
  worksheet.addRow(['Tanggal Export:', today]);
  worksheet.addRow([]);

  // Table Saldo
  worksheet.addRow(['Tabel Saldo Saat Ini']);
  worksheet.getRow(4).font = { bold: true };
  worksheet.addRow(['Dompet', 'Saldo (Rp)']);
  worksheet.getRow(5).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };

  let currentRow = 6;
  wallets.forEach(w => {
    worksheet.addRow([w.name, w.balance]);
    worksheet.getRow(currentRow).getCell(2).numFmt = '#,##0';
    currentRow++;
  });
  
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  worksheet.addRow(['TOTAL KESELURUHAN', totalBalance]);
  worksheet.getRow(currentRow).font = { bold: true };
  worksheet.getRow(currentRow).getCell(2).numFmt = '#,##0';
  currentRow += 2;

  // Table Pengeluaran
  worksheet.addRow(['Tabel Pengeluaran']);
  worksheet.getRow(currentRow).font = { bold: true, size: 12 };
  currentRow++;

  const headerRow = worksheet.addRow(['Tanggal', 'Dompet', 'Kategori', 'Catatan', 'Nominal (Rp)']);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  currentRow++;

  pengeluaran.forEach(t => {
    const row = worksheet.addRow([
      new Date(t.date).toLocaleDateString('id-ID'),
      t.wallet || 'Cash',
      t.category,
      t.note || '',
      t.amount
    ]);
    row.getCell(5).numFmt = '#,##0';
    row.alignment = { vertical: 'middle' };
  });

  // SHEET 2: SYSTEM LOGS
  if (systemLogs.length > 0) {
    const logSheet = workbook.addWorksheet('System Logs');
    logSheet.columns = [
      { header: 'Tanggal', key: 'date', width: 15 },
      { header: 'Dompet', key: 'wallet', width: 20 },
      { header: 'Kategori', key: 'category', width: 20 },
      { header: 'Catatan', key: 'note', width: 35 },
      { header: 'Nominal (Rp)', key: 'amount', width: 20 }
    ];

    const logHeader = logSheet.getRow(1);
    logHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    logHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B7280' } }; // Gray
    logHeader.alignment = { vertical: 'middle', horizontal: 'center' };

    systemLogs.forEach(t => {
      const row = logSheet.addRow({
        date: new Date(t.date).toLocaleDateString('id-ID'),
        wallet: t.wallet || 'Cash',
        category: t.category,
        note: t.note || '',
        amount: t.amount
      });
      row.getCell(5).numFmt = '#,##0';
      row.alignment = { vertical: 'middle' };
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `MoneyTracker_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

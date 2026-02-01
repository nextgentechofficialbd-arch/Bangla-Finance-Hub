import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getTransactions, getSavings, getContacts, getMonthlyReport } from './db';
import { format } from 'date-fns';

export async function generateMonthlyReportPDF(month: string, language: 'BN' | 'EN' = 'BN'): Promise<void> {
  const [transactions, savings, contacts, report] = await Promise.all([
    getTransactions({ month }),
    getSavings(month),
    getContacts(),
    getMonthlyReport(month),
  ]);

  const doc = new jsPDF();
  const isBangla = language === 'BN';
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', { 
      style: 'currency', 
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const monthDisplay = format(new Date(month + '-01'), 'MMMM yyyy');

  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129);
  doc.text(isBangla ? 'Hisab Kitab - Monthly Report' : 'Hisab Kitab - Monthly Report', 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`${isBangla ? 'Month' : 'Month'}: ${monthDisplay}`, 14, 32);
  doc.text(`${isBangla ? 'Generated' : 'Generated'}: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, 14, 40);

  doc.setDrawColor(16, 185, 129);
  doc.line(14, 45, 196, 45);

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(isBangla ? 'Summary' : 'Summary', 14, 55);

  const summaryData = [
    [isBangla ? 'Total Income' : 'Total Income', formatCurrency(report.income)],
    [isBangla ? 'Total Expense' : 'Total Expense', formatCurrency(report.expense)],
    [isBangla ? 'Balance' : 'Balance', formatCurrency(report.balance)],
    [isBangla ? 'Total Savings' : 'Total Savings', formatCurrency(report.savings)],
    [isBangla ? 'Total Payable' : 'Total Payable (Dena)', formatCurrency(report.payable)],
    [isBangla ? 'Total Receivable' : 'Total Receivable (Pona)', formatCurrency(report.receivable)],
  ];

  autoTable(doc, {
    startY: 60,
    head: [[isBangla ? 'Item' : 'Item', isBangla ? 'Amount' : 'Amount']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 10 },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 15;

  if (transactions.length > 0) {
    doc.setFontSize(14);
    doc.text(isBangla ? 'Transactions' : 'Transactions', 14, currentY);
    
    const txData = transactions.map(tx => [
      format(new Date(tx.date), 'dd MMM'),
      tx.type === 'INCOME' ? (isBangla ? 'Income' : 'Income') : (isBangla ? 'Expense' : 'Expense'),
      tx.paymentMethod,
      tx.note || '-',
      formatCurrency(tx.amount),
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [[
        isBangla ? 'Date' : 'Date',
        isBangla ? 'Type' : 'Type',
        isBangla ? 'Method' : 'Method',
        isBangla ? 'Note' : 'Note',
        isBangla ? 'Amount' : 'Amount',
      ]],
      body: txData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  if (savings.length > 0 && currentY < 250) {
    doc.setFontSize(14);
    doc.text(isBangla ? 'Savings' : 'Savings', 14, currentY);
    
    const savingsData = savings.map(s => [
      format(new Date(s.date), 'dd MMM'),
      s.purpose,
      formatCurrency(s.amount),
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [[
        isBangla ? 'Date' : 'Date',
        isBangla ? 'Purpose' : 'Purpose',
        isBangla ? 'Amount' : 'Amount',
      ]],
      body: savingsData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  const unpaidContacts = contacts.filter(c => c.status !== 'PAID');
  if (unpaidContacts.length > 0 && currentY < 250) {
    doc.setFontSize(14);
    doc.text(isBangla ? 'Dena-Pona (Due/Lending)' : 'Due/Lending', 14, currentY);
    
    const contactData = unpaidContacts.map(c => [
      c.name,
      c.phone || '-',
      c.type === 'PAYABLE' ? (isBangla ? 'Payable' : 'Payable') : (isBangla ? 'Receivable' : 'Receivable'),
      formatCurrency(c.amount - c.paidAmount),
      c.status,
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [[
        isBangla ? 'Name' : 'Name',
        isBangla ? 'Phone' : 'Phone',
        isBangla ? 'Type' : 'Type',
        isBangla ? 'Due Amount' : 'Due Amount',
        isBangla ? 'Status' : 'Status',
      ]],
      body: contactData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
      styles: { fontSize: 9 },
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Hisab Kitab - Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`hisab-kitab-report-${month}.pdf`);
}

export async function shareReport(month: string, language: 'BN' | 'EN' = 'BN'): Promise<void> {
  const report = await getMonthlyReport(month);
  const monthDisplay = format(new Date(month + '-01'), 'MMMM yyyy');
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', { 
      style: 'currency', 
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const text = language === 'BN' 
    ? `Hisab Kitab - ${monthDisplay}

Income: ${formatCurrency(report.income)}
Expense: ${formatCurrency(report.expense)}
Balance: ${formatCurrency(report.balance)}
Savings: ${formatCurrency(report.savings)}
Payable: ${formatCurrency(report.payable)}
Receivable: ${formatCurrency(report.receivable)}

- Generated by Hisab Kitab App`
    : `Hisab Kitab - ${monthDisplay}

Income: ${formatCurrency(report.income)}
Expense: ${formatCurrency(report.expense)}
Balance: ${formatCurrency(report.balance)}
Savings: ${formatCurrency(report.savings)}
Payable: ${formatCurrency(report.payable)}
Receivable: ${formatCurrency(report.receivable)}

- Generated by Hisab Kitab App`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Hisab Kitab Report - ${monthDisplay}`,
        text: text,
      });
    } catch (err) {
      console.log('Share cancelled');
    }
  } else {
    navigator.clipboard.writeText(text);
  }
}

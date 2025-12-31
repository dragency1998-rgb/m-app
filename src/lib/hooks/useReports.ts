import { useState, useEffect } from 'react';

// Type definitions for Reports

export interface InvoiceReportData {
  id: string;
  invoice: string;
  date: string;
  buyer: string;
  mfg: string;
  amount: number;
  due: string;
  status: 'PAID' | 'UNPAID' | 'RETURN';
  ageing: number;
  payment_type?: 'GST' | 'Cash';
}

export interface OrderReportData {
  id: string;
  date: string;
  quality: string;
  buyer: string;
  mfg: string;
  pending: number;
  unit: string;
  status?: 'PENDING' | 'COMPLETED';
}

export interface InvoiceReport {
  buyer: string;
  mfg: string;
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalUnpaid: number;
  overdueAmount: number;
  dueToday: number;
  dueSoon: number;
  invoices: InvoiceReportData[];
}

export interface OrderReport {
  buyer: string;
  mfg: string;
  totalOrders: number;
  totalQuantity: number;
  unit: string;
  orders: OrderReportData[];
}

export interface InvoiceReportResponse {
  buyerWise: Record<string, InvoiceReport>;
  mfgWise: Record<string, InvoiceReport>;
  summary: {
    totalBuyers: number;
    totalMfgs: number;
    totalInvoices: number;
    totalAmount: number;
    totalOverdue: number;
    totalDueToday: number;
    totalDueSoon: number;
  };
}

export interface OrderReportResponse {
  buyerWise: Record<string, OrderReport>;
  mfgWise: Record<string, OrderReport>;
  summary: {
    totalBuyers: number;
    totalMfgs: number;
    totalOrders: number;
    totalQuantity: number;
  };
}

/**
 * Hook to fetch Invoice Reports
 */
export function useInvoiceReports(groupBy: string = 'all', filter: string = 'all', buyer: string = '', mfg: string = '', paymentType: string = 'all', invoiceStatus: string = 'all') {
  const [data, setData] = useState<InvoiceReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from Firebase directly (client-side)
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');

        const artifactId = 'c_d7a58a78b230c278_TextileApp.jsx-139';
        const dataPath = `artifacts/${artifactId}/public/data`;

        // Fetch invoices from Firebase
        const invoicesRef = collection(db, dataPath, 'invoices');
        const snapshot = await getDocs(invoicesRef);
        const invoices = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as InvoiceReportData));

        console.log('===== INVOICE REPORTS DEBUG =====');
        console.log('Total Fetched invoices from Firebase:', invoices.length);
        console.log('PaymentType Filter Parameter:', paymentType);
        
        // Sample check - show first 5 invoices and their payment_type values
        console.log('Sample invoices (first 5):');
        invoices.slice(0, 5).forEach((inv, idx) => {
          console.log(`  [${idx}] Invoice: ${inv.invoice}, payment_type: "${inv.payment_type}" (type: ${typeof inv.payment_type})`);
        });
        
        // Count invoices by payment type
        const cashCount = invoices.filter(inv => inv.payment_type === 'Cash').length;
        const gstCount = invoices.filter(inv => inv.payment_type === 'GST').length;
        const noTypeCount = invoices.filter(inv => !inv.payment_type).length;
        console.log(`Payment Type Breakdown: Cash=${cashCount}, GST=${gstCount}, None=${noTypeCount}`);
        console.log('================================');

        // Apply buyer/mfg filters
        let filtered = [...invoices];
        if (buyer) {
          filtered = filtered.filter((inv) => inv.buyer === buyer);
        }
        if (mfg) {
          filtered = filtered.filter((inv) => inv.mfg === mfg);
        }

        // Apply payment type filter (case-insensitive)
        if (paymentType === 'cash') {
          const beforeCount = filtered.length;
          // Support both 'Cash', 'cash', and variations
          filtered = filtered.filter((inv) => {
            const pt = inv.payment_type?.toLowerCase();
            return pt === 'cash';
          });
          console.log(`Applied CASH filter: ${beforeCount} → ${filtered.length} invoices`);
        } else if (paymentType === 'gst') {
          const beforeCount = filtered.length;
          // Support both 'GST', 'gst', and variations
          filtered = filtered.filter((inv) => {
            const pt = inv.payment_type?.toLowerCase();
            return pt === 'gst';
          });
          console.log(`Applied GST filter: ${beforeCount} → ${filtered.length} invoices`);
        } else {
          console.log(`No payment type filter (paymentType="${paymentType}"), showing all: ${filtered.length} invoices`);
        }

        // Apply invoice status filter (PAID/UNPAID)
        if (invoiceStatus === 'paid') {
          filtered = filtered.filter((inv) => inv.status === 'PAID');
        } else if (invoiceStatus === 'unpaid') {
          filtered = filtered.filter((inv) => inv.status === 'UNPAID');
        }

        // Apply due date filters
        if (filter === 'overdue') {
          filtered = filtered.filter((inv) => inv.ageing > 0 && inv.status === 'UNPAID');
        } else if (filter === 'dueToday') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          filtered = filtered.filter((inv) => {
            const dueDate = parseDate(inv.due);
            return dueDate && dueDate.getTime() === today.getTime();
          });
        } else if (filter === 'dueSoon') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          filtered = filtered.filter((inv) => {
            const dueDate = parseDate(inv.due);
            if (!dueDate) return false;
            const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilDue >= 1 && daysUntilDue <= 3 && inv.status === 'UNPAID';
          });
        }

        // Generate report
        const report = generateInvoiceReport(filtered);
        setData(report);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invoice reports';
        setError(errorMessage);
        console.error('Invoice Reports Error:', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [groupBy, filter, buyer, mfg, paymentType, invoiceStatus]);

  return { data, loading, error };
}

// Helper to parse date string (DD-MM-YYYY format)
function parseDate(dateString: string): Date | null {
  try {
    const [day, month, year] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  } catch {
    return null;
  }
}

// Generate grouped invoice reports
function generateInvoiceReport(invoices: InvoiceReportData[]): InvoiceReportResponse {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buyerWise: Record<string, InvoiceReport> = {};
  const mfgWise: Record<string, InvoiceReport> = {};

  // Helper to process invoice data
  const processInvoice = (invoice: InvoiceReportData) => {
    const isOverdue = invoice.ageing > 0 && invoice.status === 'UNPAID';
    const dueDate = parseDate(invoice.due);
    const isDueToday = dueDate && dueDate.getTime() === today.getTime() && invoice.status === 'UNPAID';
    const isDueSoon = calculateDueSoon(dueDate, today) && invoice.status === 'UNPAID';

    return { isOverdue, dueDate, isDueToday, isDueSoon };
  };

  // Group by Buyer
  invoices.forEach((invoice) => {
    const { isOverdue, isDueToday, isDueSoon } = processInvoice(invoice);

    if (!buyerWise[invoice.buyer]) {
      buyerWise[invoice.buyer] = {
        buyer: invoice.buyer,
        mfg: '',
        totalInvoices: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalUnpaid: 0,
        overdueAmount: 0,
        dueToday: 0,
        dueSoon: 0,
        invoices: []
      };
    }

    buyerWise[invoice.buyer].totalInvoices += 1;
    buyerWise[invoice.buyer].totalAmount += invoice.amount;
    if (invoice.status === 'PAID') {
      buyerWise[invoice.buyer].totalPaid += invoice.amount;
    } else {
      buyerWise[invoice.buyer].totalUnpaid += invoice.amount;
    }
    if (isOverdue) {
      buyerWise[invoice.buyer].overdueAmount += invoice.amount;
    }
    if (isDueToday) {
      buyerWise[invoice.buyer].dueToday += invoice.amount;
    }
    if (isDueSoon) {
      buyerWise[invoice.buyer].dueSoon += invoice.amount;
    }
    buyerWise[invoice.buyer].invoices.push(invoice);
  });

  // Group by Manufacturer
  invoices.forEach((invoice) => {
    const { isOverdue, isDueToday, isDueSoon } = processInvoice(invoice);

    if (!mfgWise[invoice.mfg]) {
      mfgWise[invoice.mfg] = {
        buyer: '',
        mfg: invoice.mfg,
        totalInvoices: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalUnpaid: 0,
        overdueAmount: 0,
        dueToday: 0,
        dueSoon: 0,
        invoices: []
      };
    }

    mfgWise[invoice.mfg].totalInvoices += 1;
    mfgWise[invoice.mfg].totalAmount += invoice.amount;
    if (invoice.status === 'PAID') {
      mfgWise[invoice.mfg].totalPaid += invoice.amount;
    } else {
      mfgWise[invoice.mfg].totalUnpaid += invoice.amount;
    }
    if (isOverdue) {
      mfgWise[invoice.mfg].overdueAmount += invoice.amount;
    }
    if (isDueToday) {
      mfgWise[invoice.mfg].dueToday += invoice.amount;
    }
    if (isDueSoon) {
      mfgWise[invoice.mfg].dueSoon += invoice.amount;
    }
    mfgWise[invoice.mfg].invoices.push(invoice);
  });

  // Calculate summary
  const totalOverdue = Object.values(buyerWise).reduce((sum, report) => sum + report.overdueAmount, 0);
  const totalDueToday = Object.values(buyerWise).reduce((sum, report) => sum + report.dueToday, 0);
  const totalDueSoon = Object.values(buyerWise).reduce((sum, report) => sum + report.dueSoon, 0);
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  return {
    buyerWise,
    mfgWise,
    summary: {
      totalBuyers: Object.keys(buyerWise).length,
      totalMfgs: Object.keys(mfgWise).length,
      totalInvoices: invoices.length,
      totalAmount,
      totalOverdue,
      totalDueToday,
      totalDueSoon
    }
  };
}

// Check if invoice is due soon (1-3 days)
function calculateDueSoon(dueDate: Date | null, today: Date): boolean {
  if (!dueDate) return false;
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilDue >= 1 && daysUntilDue <= 3;
}

/**
 * Hook to fetch Order Reports
 */
export function useOrderReports(groupBy: string = 'all', status: string = 'all', buyer: string = '', mfg: string = '') {
  const [data, setData] = useState<OrderReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from Firebase directly (client-side)
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');

        const artifactId = 'c_d7a58a78b230c278_TextileApp.jsx-139';
        const dataPath = `artifacts/${artifactId}/public/data`;

        // Fetch orders from Firebase
        let allOrders: OrderReportData[] = [];
        try {
          const pendingRef = collection(db, dataPath, 'sauda_pending');
          const completedRef = collection(db, dataPath, 'sauda_completed');

          const pendingSnapshot = await getDocs(pendingRef);
          const completedSnapshot = await getDocs(completedRef);

          const pendingOrders = pendingSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            status: 'PENDING'
          } as OrderReportData));

          const completedOrders = completedSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            status: 'COMPLETED'
          } as OrderReportData));

          allOrders = [...pendingOrders, ...completedOrders];
          console.log('Fetched orders from Firebase:', allOrders.length);
        } catch (fbError) {
          console.warn('Firebase orders fetch error:', fbError);
          allOrders = [];
        }

        // Apply buyer/mfg filters
        let filtered = [...allOrders];
        if (buyer) {
          filtered = filtered.filter((order) => order.buyer === buyer);
        }
        if (mfg) {
          filtered = filtered.filter((order) => order.mfg === mfg);
        }

        // Apply status filter
        if (status === 'pending') {
          filtered = filtered.filter((order) => order.status === 'PENDING');
        } else if (status === 'completed') {
          filtered = filtered.filter((order) => order.status === 'COMPLETED');
        }

        // Generate report
        const report = generateOrderReport(filtered);
        setData(report);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order reports';
        setError(errorMessage);
        console.error('Order Reports Error:', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [groupBy, status, buyer, mfg]);

  return { data, loading, error };
}

// Generate grouped order reports
function generateOrderReport(orders: OrderReportData[]): OrderReportResponse {
  const buyerWise: Record<string, OrderReport> = {};
  const mfgWise: Record<string, OrderReport> = {};

  // Group by Buyer
  orders.forEach((order) => {
    if (!buyerWise[order.buyer]) {
      buyerWise[order.buyer] = {
        buyer: order.buyer,
        mfg: '',
        totalOrders: 0,
        totalQuantity: 0,
        unit: order.unit,
        orders: []
      };
    }

    buyerWise[order.buyer].totalOrders += 1;
    buyerWise[order.buyer].totalQuantity += order.pending || 0;
    buyerWise[order.buyer].orders.push(order);
  });

  // Group by Manufacturer
  orders.forEach((order) => {
    if (!mfgWise[order.mfg]) {
      mfgWise[order.mfg] = {
        buyer: '',
        mfg: order.mfg,
        totalOrders: 0,
        totalQuantity: 0,
        unit: order.unit,
        orders: []
      };
    }

    mfgWise[order.mfg].totalOrders += 1;
    mfgWise[order.mfg].totalQuantity += order.pending || 0;
    mfgWise[order.mfg].orders.push(order);
  });

  // Calculate summary
  let totalQuantity = 0;
  Object.values(buyerWise).forEach((report) => {
    totalQuantity += report.totalQuantity;
  });

  return {
    buyerWise,
    mfgWise,
    summary: {
      totalBuyers: Object.keys(buyerWise).length,
      totalMfgs: Object.keys(mfgWise).length,
      totalOrders: orders.length,
      totalQuantity
    }
  };
}

/**
 * Utility to format currency (INR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

/**
 * Utility to format percentage
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

/**
 * Calculate credit period in days
 */
export function calculateCreditPeriod(invoiceDate: string, dueDate: string): number {
  try {
    const [invDay, invMonth, invYear] = invoiceDate.split('-').map(Number);
    const [dueDay, dueMonth, dueYear] = dueDate.split('-').map(Number);
    const invDateObj = new Date(invYear, invMonth - 1, invDay);
    const dueDateObj = new Date(dueYear, dueMonth - 1, dueDay);
    const diffTime = Math.abs(dueDateObj.getTime() - invDateObj.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Utility to calculate payment status
 */
export function calculatePaymentStatus(
  paid: number,
  total: number
): { percentage: number; status: string } {
  if (total === 0) return { percentage: 0, status: 'No Data' };
  const percentage = (paid / total) * 100;
  if (percentage === 100) return { percentage, status: 'Fully Paid' };
  if (percentage === 0) return { percentage, status: 'Unpaid' };
  return { percentage, status: 'Partially Paid' };
}

/**
 * Export reports to CSV
 */
export function exportToCSV(data: any[], filename: string) {
  try {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return value;
          })
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
}

/**
 * Helper function to format date from DD-MM-YYYY to readable format
 */
function formatDateFromDDMMYYYY(dateStr: string): string {
  try {
    if (!dateStr || dateStr === 'Invalid Date') return 'N/A';
    const [day, month, year] = dateStr.split('-').map(Number);
    if (!day || !month || !year) return 'N/A';
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return 'N/A';
  }
}

/**
 * Export invoice details to PDF with landscape orientation
 */
export async function exportInvoiceToPDF(
  invoices: InvoiceReportData[],
  filename: string,
  title: string = 'Invoice Report'
) {
  try {
    if (!invoices || invoices.length === 0) {
      console.warn('No data to export');
      return;
    }

    const { jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    // Calculate rows per page (landscape A4: 20 rows with headers)
    const rowsPerPage = 20;
    const totalPages = Math.ceil(invoices.length / rowsPerPage);

    // Create PDF in landscape orientation (A4)

    // Create PDF in landscape orientation (A4)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Process each page separately to ensure data appears on all pages
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      const startIdx = page * rowsPerPage;
      const endIdx = Math.min(startIdx + rowsPerPage, invoices.length);
      const pageInvoices = invoices.slice(startIdx, endIdx);

      // Create container for this page
      const pageContainer = document.createElement('div');
      pageContainer.style.padding = '15px';
      pageContainer.style.backgroundColor = 'white';
      pageContainer.style.width = '297mm';
      pageContainer.style.fontFamily = 'Arial, sans-serif';
      pageContainer.style.position = 'absolute';
      pageContainer.style.left = '-9999px';

      let pageHTML = `
        <div style="font-family: Arial, sans-serif;">
          ${page === 0 ? `<h2 style="text-align: center; margin-bottom: 8px; font-size: 16px; font-weight: bold;">${title}</h2>
          <p style="text-align: right; font-size: 10px; margin-bottom: 12px;">Generated on: ${new Date().toLocaleDateString('en-IN')}</p>` : ''}
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #1f2937; color: white;">
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-weight: bold; font-size: 12px; width: 5%;">SR</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: left; font-weight: bold; font-size: 12px;">Invoice #</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: left; font-weight: bold; font-size: 12px;">Invoice Date</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: left; font-weight: bold; font-size: 12px;">Mfg Firm</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-weight: bold; font-size: 12px;">Credit Period</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: left; font-weight: bold; font-size: 12px;">Due Date</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: right; font-weight: bold; font-size: 12px; width: 10%;">Net Amount</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-weight: bold; font-size: 12px;">Payment Type</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-weight: bold; font-size: 12px;">Status</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-weight: bold; font-size: 12px;">Ageing</th>
              </tr>
            </thead>
            <tbody>
      `;

      pageInvoices.forEach((invoice, idx) => {
        const statusColor =
          invoice.status === 'PAID'
            ? '#22c55e'
            : invoice.status === 'UNPAID'
              ? '#ef4444'
              : '#f59e0b';

        const isCashInvoice = invoice.payment_type === 'Cash';
        const paymentBgColor = isCashInvoice ? '#dbeafe' : '#f3f4f6';
        const paymentTextColor = isCashInvoice ? '#1e40af' : '#1f2937';

        const creditPeriod = calculateCreditPeriod(invoice.date, invoice.due);
        const invoiceDateFormatted = formatDateFromDDMMYYYY(invoice.date);
        const dueDateFormatted = formatDateFromDDMMYYYY(invoice.due);
        const rowBgColor = isCashInvoice ? '#dbeafe' : (idx % 2 === 0 ? '#ffffff' : '#f9fafb');
        const srNumber = startIdx + idx + 1;

        pageHTML += `
          <tr style="background-color: ${rowBgColor}; border: 1px solid #ddd;">
            <td style="border: 1px solid #ddd; padding: 6px; font-size: 11px; text-align: center; font-weight: 500;">${srNumber}</td>
            <td style="border: 1px solid #ddd; padding: 6px; font-size: 11px; font-weight: 500;">${invoice.invoice}</td>
            <td style="border: 1px solid #ddd; padding: 6px; font-size: 11px;">${invoiceDateFormatted}</td>
            <td style="border: 1px solid #ddd; padding: 6px; font-size: 11px;">${invoice.mfg}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 11px;">${creditPeriod}</td>
            <td style="border: 1px solid #ddd; padding: 6px; font-size: 11px;">${dueDateFormatted}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 11px; font-weight: 500; width: 10%;">${invoice.amount.toLocaleString('en-IN')}</td>
            <td style="border: 1px solid #ddd; padding: 4px; text-align: center; font-size: 10px; vertical-align: middle; background-color: ${paymentBgColor};">
              <span style="color: ${paymentTextColor}; padding: 4px 8px; border-radius: 3px; font-weight: bold; display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; height: 20px;">
                ${invoice.payment_type || 'N/A'}
              </span>
            </td>
            <td style="border: 1px solid #ddd; padding: 4px; text-align: center; font-size: 10px; vertical-align: middle;">
              <span style="background-color: ${statusColor}; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold; display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; height: 24px;">
                ${invoice.status}
              </span>
            </td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 11px;">${invoice.ageing}</td>
          </tr>
        `;
      });

      pageHTML += `
            </tbody>
          </table>
          <p style="margin-top: 10px; text-align: center; font-size: 10px; color: #666;">Page ${page + 1} of ${totalPages}</p>
        </div>
      `;

      pageContainer.innerHTML = pageHTML;
      document.body.appendChild(pageContainer);

      // Convert page to canvas and add to PDF
      const canvas = await html2canvas(pageContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1122
      });

      const imgData = canvas.toDataURL('image/png');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

      // Clean up page container
      document.body.removeChild(pageContainer);
    }

    // Save the PDF
    pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
  }
}

/**
 * Export reports data (summary/buyer-wise) to CSV
 */
export function exportReportToCSV(data: any[], filename: string) {
  try {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return value;
          })
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
}

/**
 * Export reports data (summary/buyer-wise) to PDF with landscape orientation
 */
export async function exportReportToPDF(
  data: any[],
  headers: string[],
  filename: string,
  title: string = 'Report'
) {
  try {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const { jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    // Calculate rows per page (landscape A4: 25 rows with headers)
    const rowsPerPage = 25;
    const totalPages = Math.ceil(data.length / rowsPerPage);

    // Create PDF in landscape orientation (A4)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Process each page separately
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      const startIdx = page * rowsPerPage;
      const endIdx = Math.min(startIdx + rowsPerPage, data.length);
      const pageData = data.slice(startIdx, endIdx);

      // Create container for this page
      const pageContainer = document.createElement('div');
      pageContainer.style.padding = '15px';
      pageContainer.style.backgroundColor = 'white';
      pageContainer.style.width = '297mm';
      pageContainer.style.fontFamily = 'Arial, sans-serif';
      pageContainer.style.position = 'absolute';
      pageContainer.style.left = '-9999px';

      // Build header row
      let headerRow = '<tr style="background-color: #1f2937; color: white;">';
      headers.forEach((header) => {
        headerRow += `<th style="border: 1px solid #333; padding: 8px; text-align: left; font-weight: bold; font-size: 11px; word-break: break-word;">${header}</th>`;
      });
      headerRow += '</tr>';

      let pageHTML = `
        <div style="font-family: Arial, sans-serif;">
          ${page === 0 ? `<h2 style="text-align: center; margin-bottom: 8px; font-size: 16px; font-weight: bold;">${title}</h2>
          <p style="text-align: right; font-size: 10px; margin-bottom: 12px;">Generated on: ${new Date().toLocaleDateString('en-IN')}</p>` : ''}
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              ${headerRow}
            </thead>
            <tbody>
      `;

      pageData.forEach((row, idx) => {
        const rowBgColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
        pageHTML += `<tr style="background-color: ${rowBgColor}; border: 1px solid #ddd;">`;
        
        headers.forEach((header) => {
          const value = row[header];
          const displayValue = typeof value === 'number' ? value.toLocaleString('en-IN') : value;
          pageHTML += `<td style="border: 1px solid #ddd; padding: 6px; font-size: 10px; word-break: break-word;">${displayValue}</td>`;
        });
        
        pageHTML += '</tr>';
      });

      pageHTML += `
            </tbody>
          </table>
          <p style="margin-top: 10px; text-align: center; font-size: 10px; color: #666;">Page ${page + 1} of ${totalPages}</p>
        </div>
      `;

      pageContainer.innerHTML = pageHTML;
      document.body.appendChild(pageContainer);

      // Convert page to canvas and add to PDF
      const canvas = await html2canvas(pageContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200
      });

      const imgData = canvas.toDataURL('image/png');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

      // Clean up page container
      document.body.removeChild(pageContainer);
    }

    // Save the PDF
    pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
  }
}


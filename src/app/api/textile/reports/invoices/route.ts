import { NextRequest, NextResponse } from 'next/server';

interface InvoiceData {
  id: string;
  invoice: string;
  date: string;
  buyer: string;
  mfg: string;
  amount: number;
  due: string;
  status: 'PAID' | 'UNPAID' | 'RETURN';
  ageing: number;
  isReturn?: boolean;
}

interface InvoiceReport {
  buyer: string;
  mfg: string;
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalUnpaid: number;
  overdueAmount: number;
  dueToday: number;
  dueSoon: number;
  invoices: InvoiceData[];
}

interface GroupedInvoiceReports {
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

/**
 * Generate Invoice Reports grouped by Buyer and Manufacturer
 * with aging and status filters
 * GET /api/textile/reports/invoices?groupBy=buyer|mfg|all&filter=overdue|dueToday|dueSoon|all&buyer=name&mfg=name
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupBy = searchParams.get('groupBy') || 'all'; // buyer, mfg, all
    const filter = searchParams.get('filter') || 'all'; // overdue, dueToday, dueSoon, all
    const selectedBuyer = searchParams.get('buyer') || null; // specific buyer filter
    const selectedMfg = searchParams.get('mfg') || null; // specific mfg filter

    // Fetch from Firebase
    const { db } = await import('@/lib/firebase');
    const { collection, getDocs } = await import('firebase/firestore');

    const artifactId = 'c_d7a58a78b230c278_TextileApp.jsx-139';
    const dataPath = `artifacts/${artifactId}/public/data`;

    let invoices: InvoiceData[] = [];
    try {
      const invoicesRef = collection(db, dataPath, 'invoices');
      const snapshot = await getDocs(invoicesRef);
      invoices = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      } as InvoiceData));
    } catch (error) {
      console.warn('Firebase invoices fetch error:', error);
      invoices = [];
    }

    // Apply buyer/mfg filter
    if (selectedBuyer) {
      invoices = invoices.filter((inv) => inv.buyer === selectedBuyer);
    }
    if (selectedMfg) {
      invoices = invoices.filter((inv) => inv.mfg === selectedMfg);
    }

    // Apply filter
    let filteredInvoices = applyInvoiceFilter(invoices, filter as string);

    // Generate report
    const report = generateInvoiceReport(filteredInvoices);

    return NextResponse.json({
      success: true,
      data: report,
      metadata: {
        generatedAt: new Date().toISOString(),
        filters: { groupBy, filter },
        recordCount: filteredInvoices.length
      }
    });
  } catch (error) {
    console.error('Error generating invoice reports:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate invoice reports',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Apply aging/status filters to invoices
 */
function applyInvoiceFilter(invoices: InvoiceData[], filter: string): InvoiceData[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (filter) {
    case 'overdue':
      return invoices.filter((inv) => inv.ageing > 0 && inv.status === 'UNPAID');

    case 'dueToday':
      return invoices.filter((inv) => {
        const dueDate = parseDate(inv.due);
        return dueDate && dueDate.getTime() === today.getTime();
      });

    case 'dueSoon':
      return invoices.filter((inv) => {
        const dueDate = parseDate(inv.due);
        if (!dueDate) return false;
        const daysUntilDue = Math.ceil(
          (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilDue >= 1 && daysUntilDue <= 3 && inv.status === 'UNPAID';
      });

    case 'all':
    default:
      return invoices;
  }
}

/**
 * Helper function to generate grouped invoice reports
 */
function generateInvoiceReport(
  invoices: InvoiceData[]
): GroupedInvoiceReports {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buyerWise: Record<string, InvoiceReport> = {};
  const mfgWise: Record<string, InvoiceReport> = {};

  // Group by Buyer
  invoices.forEach((invoice) => {
    const isOverdue = invoice.ageing > 0 && invoice.status === 'UNPAID';
    const dueDate = parseDate(invoice.due);
    const isDueToday =
      dueDate && dueDate.getTime() === today.getTime() && invoice.status === 'UNPAID';
    const isDueSoon = calculateDueSoon(dueDate, today) && invoice.status === 'UNPAID';

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
    const isOverdue = invoice.ageing > 0 && invoice.status === 'UNPAID';
    const dueDate = parseDate(invoice.due);
    const isDueToday =
      dueDate && dueDate.getTime() === today.getTime() && invoice.status === 'UNPAID';
    const isDueSoon = calculateDueSoon(dueDate, today) && invoice.status === 'UNPAID';

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
  const totalOverdue = Object.values(buyerWise).reduce(
    (sum, report) => sum + report.overdueAmount,
    0
  );
  const totalDueToday = Object.values(buyerWise).reduce(
    (sum, report) => sum + report.dueToday,
    0
  );
  const totalDueSoon = Object.values(buyerWise).reduce(
    (sum, report) => sum + report.dueSoon,
    0
  );
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

/**
 * Parse date string (DD-MM-YYYY format)
 */
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

/**
 * Check if invoice is due soon (1-3 days)
 */
function calculateDueSoon(dueDate: Date | null, today: Date): boolean {
  if (!dueDate) return false;
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilDue >= 1 && daysUntilDue <= 3;
}

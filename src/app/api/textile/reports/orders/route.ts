import { NextRequest, NextResponse } from 'next/server';

interface OrderData {
  id: string;
  date: string;
  quality: string;
  buyer: string;
  mfg: string;
  pending: number;
  unit: string;
  status?: 'PENDING' | 'COMPLETED';
}

interface OrderReport {
  buyer: string;
  mfg: string;
  totalOrders: number;
  totalQuantity: number;
  unit: string;
  orders: OrderData[];
}

interface GroupedOrderReports {
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
 * Generate Order Reports grouped by Buyer and Manufacturer
 * GET /api/textile/reports/orders?groupBy=buyer|mfg|all&status=pending|completed|all&buyer=name&mfg=name
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupBy = searchParams.get('groupBy') || 'all'; // buyer, mfg, all
    const status = searchParams.get('status') || 'all'; // pending, completed, all
    const selectedBuyer = searchParams.get('buyer') || null; // specific buyer filter
    const selectedMfg = searchParams.get('mfg') || null; // specific mfg filter

    // Fetch from Firebase
    const { db } = await import('@/lib/firebase');
    const { collection, getDocs } = await import('firebase/firestore');

    const artifactId = 'c_d7a58a78b230c278_TextileApp.jsx-139';
    const dataPath = `artifacts/${artifactId}/public/data`;

    let allOrders: OrderData[] = [];
    try {
      const pendingRef = collection(db, dataPath, 'sauda_pending');
      const completedRef = collection(db, dataPath, 'sauda_completed');

      const pendingSnapshot = await getDocs(pendingRef);
      const completedSnapshot = await getDocs(completedRef);

      const pendingOrders = pendingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        status: 'PENDING'
      } as OrderData));

      const completedOrders = completedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        status: 'COMPLETED'
      } as OrderData));

      allOrders = [...pendingOrders, ...completedOrders];
    } catch (error) {
      console.warn('Firebase orders fetch error:', error);
      allOrders = [];
    }

    // Filter by buyer/mfg
    if (selectedBuyer) {
      allOrders = allOrders.filter((order) => order.buyer === selectedBuyer);
    }
    if (selectedMfg) {
      allOrders = allOrders.filter((order) => order.mfg === selectedMfg);
    }

    // Filter by status
    if (status === 'pending') {
      allOrders = allOrders.filter((order) => order.status === 'PENDING');
    } else if (status === 'completed') {
      allOrders = allOrders.filter((order) => order.status === 'COMPLETED');
    }

    // Group orders
    // Group orders
    const report = generateOrderReport(allOrders);

    return NextResponse.json({
      success: true,
      data: report,
      metadata: {
        generatedAt: new Date().toISOString(),
        filters: { groupBy, status },
        recordCount: allOrders.length
      }
    });
  } catch (error) {
    console.error('Error generating order reports:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate order reports',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to generate grouped order reports
 */
function generateOrderReport(
  orders: OrderData[]
): GroupedOrderReports {
  const buyerWise: Record<string, OrderReport> = {};
  const mfgWise: Record<string, OrderReport> = {};

  // Group by Buyer
  orders.forEach((order) => {
    if (!buyerWise[order.buyer]) {
      buyerWise[order.buyer] = {
        buyer: order.buyer,
        mfg: '', // Will be multiple
        totalOrders: 0,
        totalQuantity: 0,
        unit: order.unit,
        orders: []
      };
    }
    buyerWise[order.buyer].totalOrders += 1;
    buyerWise[order.buyer].totalQuantity += order.pending;
    buyerWise[order.buyer].orders.push(order);
  });

  // Group by Manufacturer
  orders.forEach((order) => {
    if (!mfgWise[order.mfg]) {
      mfgWise[order.mfg] = {
        buyer: '', // Will be multiple
        mfg: order.mfg,
        totalOrders: 0,
        totalQuantity: 0,
        unit: order.unit,
        orders: []
      };
    }
    mfgWise[order.mfg].totalOrders += 1;
    mfgWise[order.mfg].totalQuantity += order.pending;
    mfgWise[order.mfg].orders.push(order);
  });

  // Calculate summary
  const uniqueBuyers = new Set(orders.map((o) => o.buyer)).size;
  const uniqueMfgs = new Set(orders.map((o) => o.mfg)).size;
  const totalQuantity = orders.reduce((sum, o) => sum + o.pending, 0);

  return {
    buyerWise,
    mfgWise,
    summary: {
      totalBuyers: uniqueBuyers,
      totalMfgs: uniqueMfgs,
      totalOrders: orders.length,
      totalQuantity
    }
  };
}

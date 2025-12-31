import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    // Fetch invoices from Firebase
    const artifactId = 'c_d7a58a78b230c278_TextileApp.jsx-139';
    const dataPath = `artifacts/${artifactId}/public/data`;

    let invoices: any[] = [];
    try {
      const invoicesRef = collection(db, dataPath, 'invoices');
      const snapshot = await getDocs(invoicesRef);
      invoices = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.warn('Failed to fetch invoices from Firebase:', error);
    }

    // Calculate ageing buckets from invoices
    const calculateAgeingBuckets = (invoices: any[]) => {
      const buyerMap: Record<string, any> = {};
      const mfgMap: Record<string, any> = {};

      invoices.forEach((inv) => {
        const amount = Number(inv.amount) || 0;
        const ageing = Number(inv.ageing) || 0;

        // Calculate buyer ageing
        if (!buyerMap[inv.buyer]) {
          buyerMap[inv.buyer] = {
            firm: inv.buyer,
            total: 0,
            notDue: 0,
            days0_7: 0,
            days8_30: 0,
            days30_200: 0
          };
        }

        buyerMap[inv.buyer].total += amount;

        // Assign to correct bucket based on ageing value
        if (ageing <= 0) {
          buyerMap[inv.buyer].notDue += amount;
        } else if (ageing >= 1 && ageing <= 7) {
          buyerMap[inv.buyer].days0_7 += amount;
        } else if (ageing >= 8 && ageing <= 30) {
          buyerMap[inv.buyer].days8_30 += amount;
        } else if (ageing > 30 && ageing <= 200) {
          buyerMap[inv.buyer].days30_200 += amount;
        }

        // Calculate manufacturer ageing
        if (!mfgMap[inv.mfg]) {
          mfgMap[inv.mfg] = {
            firm: inv.mfg,
            total: 0,
            notDue: 0,
            days0_7: 0,
            days8_30: 0,
            days30_200: 0
          };
        }

        mfgMap[inv.mfg].total += amount;

        // Assign to correct bucket based on ageing value
        if (ageing <= 0) {
          mfgMap[inv.mfg].notDue += amount;
        } else if (ageing >= 1 && ageing <= 7) {
          mfgMap[inv.mfg].days0_7 += amount;
        } else if (ageing >= 8 && ageing <= 30) {
          mfgMap[inv.mfg].days8_30 += amount;
        } else if (ageing > 30 && ageing <= 200) {
          mfgMap[inv.mfg].days30_200 += amount;
        }
      });

      return {
        buyerAgeing: Object.values(buyerMap),
        mfgAgeing: Object.values(mfgMap)
      };
    };

    const ageingData = calculateAgeingBuckets(invoices);

    return NextResponse.json({
      success: true,
      data: {
        buyerAgeing: ageingData.buyerAgeing,
        mfgAgeing: ageingData.mfgAgeing
      },
      metadata: {
        invoicesProcessed: invoices.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error calculating ageing data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate ageing data' },
      { status: 500 }
    );
  }
}

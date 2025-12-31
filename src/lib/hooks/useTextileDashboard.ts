import { useState, useEffect } from 'react';

interface Invoice {
  id: string;
  invoice: string;
  date: string;
  buyer: string;
  mfg: string;
  amount: number;
  due: string;
  status: 'PAID' | 'UNPAID' | 'RETURN';
  isReturn?: boolean;
  ageing: number;
}

interface AgeingRecord {
  id: string;
  firm: string;
  total: number;
  notDue: number;
  days0_7: number;
  days8_30: number;
  days30_200: number;
}

interface SaudaOrder {
  id: string;
  date: string;
  quality: string;
  buyer: string;
  mfg: string;
  pending: number;
  unit: string;
}

interface DashboardData {
  invoices: Invoice[];
  buyerAgeing: AgeingRecord[];
  mfgAgeing: AgeingRecord[];
  pendingSauda: SaudaOrder[];
  completedSauda: SaudaOrder[];
}

export function useTextileDashboard() {
  const [data, setData] = useState<DashboardData>({
    invoices: [],
    buyerAgeing: [],
    mfgAgeing: [],
    pendingSauda: [],
    completedSauda: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invoicesRes, ageingRes, ordersRes] = await Promise.all([
          fetch('/api/textile/invoices'),
          fetch('/api/textile/ageing'),
          fetch('/api/textile/orders')
        ]);

        if (!invoicesRes.ok || !ageingRes.ok || !ordersRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const invoicesData = await invoicesRes.json();
        const ageingData = await ageingRes.json();
        const ordersData = await ordersRes.json();

        setData({
          invoices: invoicesData.data || [],
          buyerAgeing: ageingData.data?.buyerAgeing || [],
          mfgAgeing: ageingData.data?.mfgAgeing || [],
          pendingSauda: ordersData.data?.pendingSauda || [],
          completedSauda: ordersData.data?.completedSauda || []
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

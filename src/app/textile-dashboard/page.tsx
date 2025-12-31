'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Factory,
  Clock,
  FileText,
  Search,
  Filter,
  Calendar,
  Home,
  ChevronDown,
  X,
  TrendingDown,
  AlertCircle,
  ArrowLeft,
  CloudLightning,
  RefreshCw,
  Copy,
  AlertTriangle,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, Badge } from '@/components/ui/Card';
import ReportsModule from '@/components/reports/ReportsModule';

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
  payment_type?: 'GST' | 'Cash';
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
  ordered?: number;
  sent?: number;
}

interface DashboardData {
  buyerAgeing: AgeingRecord[];
  mfgAgeing: AgeingRecord[];
  pendingSauda: SaudaOrder[];
  completedSauda: SaudaOrder[];
  invoices: Invoice[];
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export default function TextileHubDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [hideOutstanding, setHideOutstanding] = useState(true); // Hidden by default

  const [data, setData] = useState<DashboardData>({
    buyerAgeing: [],
    mfgAgeing: [],
    pendingSauda: [],
    completedSauda: [],
    invoices: []
  });

  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [drillDownFilter, setDrillDownFilter] = useState<{
    firm: string;
    bucket: string;
    type: string;
  } | null>(null);

  // FILTERS
  const [invoiceFilters, setInvoiceFilters] = useState({
    status: 'ALL',
    buyer: '',
    mfg: '',
    ageingType: 'ALL',
    dueDateFilter: 'ALL', // NEW: 'ALL', 'OVERDUE', 'DUE_TODAY', 'DUE_1_3_DAYS', 'UNPAID'
    paymentType: 'all' // NEW: 'all', 'cash', 'gst'
  });

  // Pending filters (before Apply is clicked)
  const [pendingInvoiceFilters, setPendingInvoiceFilters] = useState({
    status: 'ALL',
    buyer: '',
    mfg: '',
    ageingType: 'ALL',
    dueDateFilter: 'ALL',
    paymentType: 'all' // NEW: 'all', 'cash', 'gst'
  });

  // Pending Orders Filters
  const [pendingOrderFilters, setPendingOrderFilters] = useState({
    fulfillmentThreshold: 95, // Filter for orders with < 95% fulfillment
    buyer: '',
    mfg: ''
  });

  const [showPendingOrderFilters, setShowPendingOrderFilters] = useState(false);

  const [ageingFilters, setAgeingFilters] = useState({
    minTotal: '',
    hasOverdue: false,
    sortBy: 'total'
  });

  // Firebase real-time data sync
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const loadFirebaseData = async () => {
      try {
        const { collection, onSnapshot } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');

        // The actual artifact name in your Firebase structure
        const artifactId = 'c_d7a58a78b230c278_TextileApp.jsx-139';

        let unsubscribers: Array<() => void> = [];
        setLoading(true);

        // Helper to clean data from snapshots
        const cleanData = (snapshot: any) =>
          snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

        // Path structure: artifacts/{artifactId}/public/data/{collectionName}
        const dataPath = `artifacts/${artifactId}/public/data`;

        console.log('Firebase Data Path:', dataPath);

        // Listen to invoices in real-time
        try {
          const invoicesRef = collection(db, dataPath, 'invoices');
          unsubscribers.push(
            onSnapshot(invoicesRef, async (snapshot) => {
              console.log('Invoices fetched:', snapshot.docs.length);
              const invoices = cleanData(snapshot);
              setData((prev) => ({ ...prev, invoices }));

              // Calculate ageing data from invoices
              const calculateAgeingFromInvoices = () => {
                const buyerMap: Record<string, any> = {};
                const mfgMap: Record<string, any> = {};

                invoices.forEach((inv: any) => {
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

                const buyerAgeing = Object.values(buyerMap);
                const mfgAgeing = Object.values(mfgMap);

                // Log for debugging
                buyerAgeing.forEach((buyer: any) => {
                  const bifurcationSum = (buyer.notDue || 0) + (buyer.days0_7 || 0) + (buyer.days8_30 || 0) + (buyer.days30_200 || 0);
                  const difference = buyer.total - bifurcationSum;
                  console.log(`${buyer.firm}: Total=${buyer.total}, NotDue=${buyer.notDue}, 0-7=${buyer.days0_7}, 8-30=${buyer.days8_30}, 30-200=${buyer.days30_200}, Sum=${bifurcationSum}, Diff=${difference}`);
                });

                return { buyerAgeing, mfgAgeing };
              };

              const ageingData = calculateAgeingFromInvoices();
              setData((prev) => ({ 
                ...prev, 
                buyerAgeing: ageingData.buyerAgeing,
                mfgAgeing: ageingData.mfgAgeing
              }));
            })
          );
        } catch (error) {
          console.warn('Invoices collection error:', error);
        }

        // DO NOT listen to ageing collections - they are calculated from invoices above
        // This prevents using stale/incorrect cached data
        try {
          const buyerAgeingRef = collection(db, dataPath, 'ageing_buyer');
          unsubscribers.push(
            onSnapshot(buyerAgeingRef, (snapshot) => {
              console.log('Buyer ageing collection updated (backup - ageing calculated from invoices):', snapshot.docs.length);
              // Don't use this data - it's kept for reference only
            })
          );
        } catch (error) {
          console.warn('Buyer ageing error:', error);
        }

        // DO NOT listen to manufacturer ageing collections - calculated from invoices
        try {
          const mfgAgeingRef = collection(db, dataPath, 'ageing_mfg');
          unsubscribers.push(
            onSnapshot(mfgAgeingRef, (snapshot) => {
              console.log('Mfg ageing collection updated (backup - ageing calculated from invoices):', snapshot.docs.length);
              // Don't use this data - it's kept for reference only
            })
          );
        } catch (error) {
          console.warn('Mfg ageing error:', error);
        }

        // Listen to pending orders in real-time
        try {
          const pendingSaudaRef = collection(db, dataPath, 'sauda_pending');
          unsubscribers.push(
            onSnapshot(pendingSaudaRef, (snapshot) => {
              console.log('Pending orders fetched:', snapshot.docs.length);
              setData((prev) => ({ ...prev, pendingSauda: cleanData(snapshot) }));
            })
          );
        } catch (error) {
          console.warn('Pending orders error:', error);
        }

        // Listen to completed orders in real-time
        try {
          const completedSaudaRef = collection(db, dataPath, 'sauda_completed');
          unsubscribers.push(
            onSnapshot(completedSaudaRef, (snapshot) => {
              console.log('Completed orders fetched:', snapshot.docs.length);
              setData((prev) => ({ ...prev, completedSauda: cleanData(snapshot) }));
            })
          );
        } catch (error) {
          console.warn('Completed orders error:', error);
        }

        setLoading(false);

        // Cleanup function
        return () => {
          unsubscribers.forEach((unsub) => unsub());
        };
      } catch (error) {
        console.error('Failed to load Firebase data:', error);
        setPermissionError(true);
        setLoading(false);
      }
    };

    const cleanup = loadFirebaseData();
    return () => {
      cleanup?.then((fn) => fn?.());
    };
  }, [isAuthenticated, user]);

  // Sync pending filters when applied filters change (for external updates)
  useEffect(() => {
    setPendingInvoiceFilters(invoiceFilters);
  }, [invoiceFilters]);  // HELPERS
  const clearFilters = (type: string) => {
    if (type === 'invoice') {
      const resetFilters = { status: 'ALL', buyer: '', mfg: '', ageingType: 'ALL', dueDateFilter: 'ALL', paymentType: 'all' };
      setInvoiceFilters(resetFilters);
      setPendingInvoiceFilters(resetFilters);
      setDrillDownFilter(null);
    } else if (type === 'ageing') {
      setAgeingFilters({ minTotal: '', hasOverdue: false, sortBy: 'total' });
    } else if (type === 'pendingOrders') {
      setPendingOrderFilters({ fulfillmentThreshold: 95, buyer: '', mfg: '' });
    }
  };

  // Apply pending filters
  const applyInvoiceFilters = () => {
    setInvoiceFilters(pendingInvoiceFilters);
  };

  const handleAgeingClick = (firm: string, bucket: string, type: string) => {
    setDrillDownFilter({ firm, bucket, type });
    setActiveTab('invoices');
    const resetFilters = { status: 'ALL', buyer: '', mfg: '', ageingType: 'ALL', dueDateFilter: 'ALL', paymentType: 'all' };
    setInvoiceFilters(resetFilters);
    setPendingInvoiceFilters(resetFilters);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchTerm('');
    setShowFilters(false);
    if (tab !== 'invoices') setDrillDownFilter(null);
  };

  const copyAppId = () => {
    const appId = 'textile_hub_app_id';
    try {
      const textArea = document.createElement('textarea');
      textArea.value = appId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log('App ID copied');
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  // Dropdown Data - SMART FILTERS based on active filter (using pendingInvoiceFilters for dynamic dropdowns)
  const getFilteredInvoices = useMemo(() => {
    return data.invoices.filter((inv) => {
      // Apply due date filter
      if (pendingInvoiceFilters.dueDateFilter !== 'ALL') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = inv.due ? new Date(inv.due.split('-').reverse().join('-')) : null;
        
        if (!dueDate) return false;

        if (pendingInvoiceFilters.dueDateFilter === 'OVERDUE') {
          if (!(inv.ageing > 0 && inv.status === 'UNPAID')) return false;
        } else if (pendingInvoiceFilters.dueDateFilter === 'DUE_TODAY') {
          if (dueDate.getTime() !== today.getTime()) return false;
        } else if (pendingInvoiceFilters.dueDateFilter === 'DUE_1_3_DAYS') {
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilDue < 1 || daysUntilDue > 3) return false;
        } else if (pendingInvoiceFilters.dueDateFilter === 'UNPAID') {
          if (inv.status !== 'UNPAID') return false;
        }
      }

      return true;
    });
  }, [data.invoices, pendingInvoiceFilters.dueDateFilter]);

  const invoiceBuyers = useMemo(
    () => [...new Set(getFilteredInvoices.map((i) => i.buyer))].sort(),
    [getFilteredInvoices]
  );
  const invoiceMfgs = useMemo(
    () => [...new Set(getFilteredInvoices.map((i) => i.mfg))].sort(),
    [getFilteredInvoices]
  );

  // Stats
  const stats = useMemo(() => {
    const totalBuyerDue = data.buyerAgeing.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    const totalMfgDue = data.mfgAgeing.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    const pendingOrders = data.pendingSauda.length;
    const completedOrders = data.completedSauda.length;
    const overdueInvoices = data.invoices.filter(
      (inv) => inv.ageing > 0 && inv.status === 'UNPAID'
    ).length;
    // Total outstanding payment from all unpaid invoices
    const totalOutstandingPayment = data.invoices
      .filter((inv) => inv.status === 'UNPAID')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    return { totalBuyerDue, totalMfgDue, pendingOrders, completedOrders, overdueInvoices, totalOutstandingPayment };
  }, [data]);

  // RENDER FUNCTIONS
  const renderDashboard = () => (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* App ID Widget */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full text-blue-600">
            <CloudLightning size={20} />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 text-sm">TextileHub Dashboard</h4>
            <p className="text-xs text-blue-700">Real-time textile business metrics</p>
          </div>
        </div>
        <button
          onClick={copyAppId}
          className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-blue-200"
        >
          <code className="text-xs font-mono text-slate-600">textile_hub</code>
          <Copy size={16} className="text-blue-600" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex justify-between items-start mb-2">
            <div className="text-xs text-slate-500 font-semibold uppercase">Total Outstanding</div>
            <button
              onClick={() => setHideOutstanding(!hideOutstanding)}
              className="p-1 hover:bg-red-100 rounded transition-colors"
              title={hideOutstanding ? 'Show amount' : 'Hide amount'}
            >
              {hideOutstanding ? (
                <EyeOff className="text-red-400" size={20} />
              ) : (
                <Eye className="text-red-400" size={20} />
              )}
            </button>
          </div>
          <div className="text-xl font-bold text-slate-800">
            {hideOutstanding ? '*********' : formatCurrency(stats.totalOutstandingPayment)}
          </div>
          <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <TrendingDown size={12} /> Unpaid invoices
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-orange-500">
          <div className="flex justify-between items-start mb-2">
            <div className="text-xs text-slate-500 font-semibold uppercase">Pending</div>
            <Clock className="text-orange-200" size={20} />
          </div>
          <div className="text-xl font-bold text-slate-800">{stats.pendingOrders}</div>
          <div className="text-xs text-orange-600 mt-1">Active orders</div>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-800">{stats.completedOrders}</div>
            <div className="text-xs text-slate-500">Completed Sauda</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{stats.overdueInvoices}</div>
            <div className="text-xs text-slate-500">Overdue Invoices</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{data.invoices.filter(inv => inv.status === 'UNPAID').length}</div>
            <div className="text-xs text-slate-500">Unpaid Invoices</div>
          </div>
        </div>
      </Card>

      {/* Top Dues */}
      <Card className="overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Users size={16} className="text-red-500" /> Top Dues
          </h3>
          <button onClick={() => setActiveTab('buyerAgeing')} className="text-xs text-blue-600">
            View All
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {data.buyerAgeing.slice(0, 5).map((item, idx) => (
            <div key={idx} className="p-3 flex justify-between items-center">
              <div className="overflow-hidden">
                <p className="font-medium text-slate-800 text-sm truncate">{item.firm}</p>
                {item.days30_200 > 0 && (
                  <span className="text-xs text-red-600">30-200d: {formatCurrency(item.days30_200)}</span>
                )}
              </div>
              <span className="font-bold text-slate-700 text-sm">{formatCurrency(item.total)}</span>
            </div>
          ))}
          {data.buyerAgeing.length === 0 && (
            <div className="p-4 text-center text-slate-400 text-sm">No data available</div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderInvoices = () => {
    let filtered = data.invoices.filter((inv) => {
      if (drillDownFilter) {
        const matchesFirm =
          drillDownFilter.type === 'Buyer' ? inv.buyer === drillDownFilter.firm : inv.mfg === drillDownFilter.firm;
        if (!matchesFirm) return false;

        if (drillDownFilter.bucket === 'notDue') return inv.ageing <= 0;
        if (drillDownFilter.bucket === 'days0_7') return inv.ageing > 0 && inv.ageing <= 7;
        if (drillDownFilter.bucket === 'days8_30') return inv.ageing >= 8 && inv.ageing <= 30;
        if (drillDownFilter.bucket === 'days30_200') return inv.ageing > 30 && inv.ageing <= 200;
        return true;
      }

      const matchesSearch =
        inv.buyer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.mfg?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (invoiceFilters.status !== 'ALL') {
        if (invoiceFilters.status === 'OTHER')
          matchesStatus =
            !['PAID', 'UNPAID', 'RETURN'].includes(inv.status) && !(inv.isReturn ?? false);
        else if (invoiceFilters.status === 'RETURN') matchesStatus = inv.isReturn ?? false;
        else matchesStatus = inv.status === invoiceFilters.status;
      }

      // NEW: Due Date Filter Logic
      let matchesDueDate = true;
      if (invoiceFilters.dueDateFilter !== 'ALL') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = inv.due ? new Date(inv.due.split('-').reverse().join('-')) : null;
        
        if (!dueDate) {
          matchesDueDate = false;
        } else if (invoiceFilters.dueDateFilter === 'OVERDUE') {
          matchesDueDate = inv.ageing > 0 && inv.status === 'UNPAID';
        } else if (invoiceFilters.dueDateFilter === 'DUE_TODAY') {
          matchesDueDate = dueDate.getTime() === today.getTime();
        } else if (invoiceFilters.dueDateFilter === 'DUE_1_3_DAYS') {
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          matchesDueDate = daysUntilDue >= 1 && daysUntilDue <= 3;
        } else if (invoiceFilters.dueDateFilter === 'UNPAID') {
          matchesDueDate = inv.status === 'UNPAID';
        }
      }

      let matchesAgeing = true;
      if (invoiceFilters.ageingType === 'OVERDUE')
        matchesAgeing = inv.ageing > 0 && inv.status === 'UNPAID';
      else if (invoiceFilters.ageingType === 'UPCOMING')
        matchesAgeing = inv.ageing <= 0 && inv.status === 'UNPAID';

      // NEW: Payment Type Filter Logic (case-insensitive)
      let matchesPaymentType = true;
      if (invoiceFilters.paymentType !== 'all') {
        if (invoiceFilters.paymentType === 'cash') {
          matchesPaymentType = inv.payment_type?.toLowerCase() === 'cash';
        } else if (invoiceFilters.paymentType === 'gst') {
          matchesPaymentType = inv.payment_type?.toLowerCase() === 'gst';
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesAgeing &&
        matchesDueDate &&
        matchesPaymentType &&
        (!invoiceFilters.buyer || inv.buyer === invoiceFilters.buyer) &&
        (!invoiceFilters.mfg || inv.mfg === invoiceFilters.mfg)
      );
    });

    filtered.sort((a, b) => {
      const isOverdueA = a.ageing > 0 && a.status === 'UNPAID';
      const isOverdueB = b.ageing > 0 && b.status === 'UNPAID';
      if (isOverdueA && !isOverdueB) return -1;
      if (!isOverdueA && isOverdueB) return 1;
      const dateA = a.due ? a.due.split('-').reverse().join('-') : '';
      const dateB = b.due ? b.due.split('-').reverse().join('-') : '';
      return dateA.localeCompare(dateB);
    });

    return (
      <div className="space-y-3">
        {drillDownFilter && (
          <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <button onClick={() => setDrillDownFilter(null)} className="hover:bg-blue-100 p-1 rounded transition-colors">
                <ArrowLeft size={18} className="text-blue-700" />
              </button>
              <div>
                <span className="font-bold text-sm text-blue-900">{drillDownFilter.firm}</span>
                <span className="text-xs text-blue-700 ml-2">
                  ({drillDownFilter.bucket
                    .replace('days', '')
                    .replace('plus', '+')
                    .replace('_', '-')})
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-600">Filtered Results</div>
              <div className="font-bold text-blue-700">
                {filtered.length} invoices • {formatCurrency(filtered.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0))}
              </div>
            </div>
            <button onClick={() => setDrillDownFilter(null)} className="hover:bg-blue-100 p-1 rounded transition-colors ml-2">
              <X size={16} className="text-blue-700" />
            </button>
          </div>
        )}

        {!drillDownFilter && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search invoices..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-blue-600" />
                <span className="font-medium text-slate-700">Filters</span>
              </div>
              <ChevronDown className={`text-slate-400 ${showFilters ? 'rotate-180' : ''}`} size={20} />
            </button>
          </>
        )}

        {showFilters && !drillDownFilter && (
          <Card className="p-4 space-y-4">
            {/* Due Date Filters - NEW */}
            <div>
              <label className="text-xs font-bold text-slate-500 mb-2 block">DUE DATE FILTERS</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 'OVERDUE', label: 'Overdue' },
                  { key: 'DUE_TODAY', label: 'Due Today' },
                  { key: 'DUE_1_3_DAYS', label: 'Due in 1-3 Days' },
                  { key: 'UNPAID', label: 'Unpaid' }
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setPendingInvoiceFilters((p) => ({ ...p, dueDateFilter: f.key }))}
                    className={`px-3 py-1 rounded text-xs border transition-all ${
                      pendingInvoiceFilters.dueDateFilter === f.key 
                        ? 'bg-green-600 text-white border-green-600' 
                        : 'bg-white border-slate-300 hover:border-green-400'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <label className="text-xs font-bold text-slate-500">STATUS</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {['ALL', 'UNPAID', 'PAID'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPendingInvoiceFilters((p) => ({ ...p, status: s }))}
                    className={`px-3 py-1 rounded text-xs border ${
                      pendingInvoiceFilters.status === s ? 'bg-blue-600 text-white' : 'bg-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Type Filter - NEW */}
            <div className="border-t border-slate-200 pt-3">
              <label className="text-xs font-bold text-slate-500">💳 PAYMENT TYPE</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'cash', label: '💰 Cash Invoice' },
                  { key: 'gst', label: '📄 GST Invoice' }
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPendingInvoiceFilters((prev) => ({ ...prev, paymentType: p.key }))}
                    className={`px-3 py-1 rounded text-xs border transition-all ${
                      pendingInvoiceFilters.paymentType === p.key 
                        ? 'bg-purple-600 text-white border-purple-600' 
                        : 'bg-white border-slate-300 hover:border-purple-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">BUYER</label>
                <select
                  className="w-full p-2 border rounded text-xs"
                  value={pendingInvoiceFilters.buyer}
                  onChange={(e) => setPendingInvoiceFilters((p) => ({ ...p, buyer: e.target.value }))}
                >
                  <option value="">All Buyers</option>
                  {invoiceBuyers.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">MFG</label>
                <select
                  className="w-full p-2 border rounded text-xs"
                  value={pendingInvoiceFilters.mfg}
                  onChange={(e) => setPendingInvoiceFilters((p) => ({ ...p, mfg: e.target.value }))}
                >
                  <option value="">All Mfg</option>
                  {invoiceMfgs.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Apply & Clear Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={applyInvoiceFilters}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={() => clearFilters('invoice')}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </Card>
        )}

        {/* Invoice Count Badge */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-xs font-bold text-slate-700">
              Showing invoices:
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">
                {formatCurrency(filtered.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0))}
              </span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                {filtered.length} {filtered.length === 1 ? 'invoice' : 'invoices'}
              </span>
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <span className="text-xs text-yellow-800 font-medium">No invoices found matching your filters</span>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((inv, idx) => {
            const isOverdue = inv.ageing > 0 && inv.status === 'UNPAID';
            const isPaid = inv.status === 'PAID';
            const statusColor = isPaid ? 'green' : (inv.isReturn ?? false) ? 'purple' : isOverdue ? 'red' : 'blue';
            const isCashInvoice = inv.payment_type?.toLowerCase() === 'cash';

            return (
              <Card 
                key={idx} 
                className={`p-4 ${isCashInvoice ? 'bg-blue-50 border-blue-200 border' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-lg">#{inv.invoice}</span>
                      <Badge color={statusColor}>{inv.status}</Badge>
                      {isCashInvoice && <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded font-bold">💰 CASH</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      <Calendar size={12} className="inline mr-1" />
                      {inv.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-slate-800">{formatCurrency(inv.amount)}</div>
                    {!isPaid && !(inv.isReturn ?? false) && (
                      <div className={`text-xs font-bold ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                        {isOverdue ? `${inv.ageing}d overdue` : `Due in ${Math.abs(inv.ageing)}d`}
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 rounded p-2 space-y-1 text-sm border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-xs">Buyer</span>
                    <span className="font-black text-slate-800">{inv.buyer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-xs">Mfg</span>
                    <span className="font-black text-slate-800">{inv.mfg}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 mt-1 text-xs">
                    <span className="text-slate-500">Due</span>
                    <span className="font-medium">{inv.due}</span>
                  </div>
                </div>
              </Card>
            );
          })}
          {filtered.length === 0 && <div className="text-center py-8 text-slate-400">No invoices found</div>}
        </div>
      </div>
    );
  };

  const renderAgeingList = (listData: AgeingRecord[], type: string) => {
    let filtered = listData.filter((item) => item.firm.toLowerCase().includes(searchTerm.toLowerCase()));
    if (ageingFilters.minTotal) filtered = filtered.filter((i) => i.total >= Number(ageingFilters.minTotal));
    if (ageingFilters.hasOverdue) filtered = filtered.filter((i) => i.days30_200 > 0);

    if (ageingFilters.sortBy === 'firm') filtered.sort((a, b) => a.firm.localeCompare(b.firm));
    else if (ageingFilters.sortBy === 'overdue') filtered.sort((a, b) => b.days30_200 - a.days30_200);
    else filtered.sort((a, b) => b.total - a.total);

    return (
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={`Search ${type}...`}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="space-y-3">
          {filtered.map((row, i) => {
            const bifurcationSum = (row.notDue || 0) + (row.days0_7 || 0) + (row.days8_30 || 0) + (row.days30_200 || 0);
            const hasDiscrepancy = Math.abs(bifurcationSum - row.total) > 1; // Allow 1 unit for rounding

            return (
            <Card key={i} className={`p-4 ${hasDiscrepancy ? 'border-2 border-red-300 bg-red-50' : ''}`}>
              <div className="flex justify-between border-b pb-2 mb-2">
                <span className="font-bold text-lg">{row.firm}</span>
                <div className="text-right">
                  <span className="font-bold text-blue-600 text-lg">{formatCurrency(row.total)}</span>
                  {hasDiscrepancy && (
                    <div className="text-xs text-red-600 font-semibold">
                      ⚠ Bifurcation: {formatCurrency(bifurcationSum)} (Diff: {formatCurrency(row.total - bifurcationSum)})
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div
                  onClick={() => handleAgeingClick(row.firm, 'notDue', type)}
                  className="p-2 bg-green-50 rounded cursor-pointer border border-green-100 hover:bg-green-100"
                >
                  <div className="text-green-700 font-bold">Not Due</div>
                  <div>{formatCurrency(row.notDue)}</div>
                </div>
                <div
                  onClick={() => handleAgeingClick(row.firm, 'days0_7', type)}
                  className="p-2 bg-blue-50 rounded cursor-pointer border border-blue-100 hover:bg-blue-100"
                >
                  <div className="text-blue-700 font-bold">0-7 Days</div>
                  <div>{formatCurrency(row.days0_7)}</div>
                </div>
                <div
                  onClick={() => handleAgeingClick(row.firm, 'days8_30', type)}
                  className="p-2 bg-orange-50 rounded cursor-pointer border border-orange-100 hover:bg-orange-100"
                >
                  <div className="text-orange-700 font-bold">8-30 Days</div>
                  <div>{formatCurrency(row.days8_30)}</div>
                </div>
                <div
                  onClick={() => handleAgeingClick(row.firm, 'days30_200', type)}
                  className={`p-2 rounded cursor-pointer border hover:bg-opacity-80 ${
                    row.days30_200 > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className={`${row.days30_200 > 0 ? 'text-red-700' : 'text-slate-500'} font-bold`}>
                    30-200 Days
                  </div>
                  <div>{formatCurrency(row.days30_200)}</div>
                </div>
              </div>
            </Card>
            );
          })}
          {filtered.length === 0 && <div className="text-center py-8 text-slate-400">No results</div>}
        </div>
      </div>
    );
  };

  if (permissionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200 max-w-md text-center">
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Permission Denied</h2>
          <p className="text-slate-600 mb-4">
            The App cannot read the database. This usually means the <strong>Firestore Security Rules</strong> are
            locking it out.
          </p>
          <div className="bg-slate-50 p-3 rounded text-left text-xs font-mono mb-4 border border-slate-200">
            {`match /artifacts/{appId}/{document=**} {\n  allow read, write: if true;\n}`}
          </div>
          <p className="text-xs text-slate-500">
            Please go to Firebase Console -&gt; Firestore -&gt; Rules and paste the code above.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-2 text-blue-500" />
          <p>Syncing Live Data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-blue-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Authentication Required</h2>
          <p className="text-slate-600 mt-2">Please log in to access the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 md:flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
        <div className="p-6 font-bold text-xl text-slate-800 border-b flex items-center gap-2">
          <LayoutDashboard className="text-blue-600" />
          TextileHub
        </div>
        <div className="flex-1 p-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'pending', label: 'Pending Orders', icon: Clock },
            { id: 'invoices', label: 'Invoices', icon: FileText },
            { id: 'buyerAgeing', label: 'Buyer Ageing', icon: Users },
            { id: 'mfgAgeing', label: 'Mfg Ageing', icon: Factory },
            { id: 'reports', label: 'Reports', icon: BarChart3 }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>
        <div className="p-4 border-t text-xs text-slate-400">App ID: textile_hub...</div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 border-b flex justify-between items-center sticky top-0 z-10">
          <span className="font-bold text-lg flex items-center gap-2">
            <LayoutDashboard className="text-blue-600" /> TextileHub
          </span>
          {activeTab === 'dashboard' && <CloudLightning size={20} className="text-green-500" />}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'invoices' && renderInvoices()}
          {activeTab === 'buyerAgeing' && renderAgeingList(data.buyerAgeing, 'Buyer')}
          {activeTab === 'mfgAgeing' && renderAgeingList(data.mfgAgeing, 'Manufacturer')}
          {activeTab === 'reports' && <ReportsModule />}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {/* Filter Controls */}
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Filter size={18} className="text-blue-600" />
                    <h3 className="font-bold text-slate-800">Filters</h3>
                  </div>
                  <button
                    onClick={() => setShowPendingOrderFilters(!showPendingOrderFilters)}
                    className="text-blue-600 hover:text-blue-800 transition"
                  >
                    <ChevronDown size={20} style={{ transform: showPendingOrderFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                  </button>
                </div>

                {showPendingOrderFilters && (
                  <div className="space-y-4 border-t pt-4">
                    {/* Fulfillment Threshold Filter */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Show orders with fulfillment below:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={pendingOrderFilters.fulfillmentThreshold}
                          onChange={(e) => setPendingOrderFilters({ ...pendingOrderFilters, fulfillmentThreshold: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="font-bold text-blue-600 w-12 text-right">{pendingOrderFilters.fulfillmentThreshold}%</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Only orders with less than {pendingOrderFilters.fulfillmentThreshold}% fulfillment will be shown</p>
                    </div>

                    {/* Buyer Filter */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Buyer</label>
                      <input
                        type="text"
                        placeholder="Filter by buyer name..."
                        value={pendingOrderFilters.buyer}
                        onChange={(e) => setPendingOrderFilters({ ...pendingOrderFilters, buyer: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Manufacturer Filter */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Manufacturer</label>
                      <input
                        type="text"
                        placeholder="Filter by manufacturer name..."
                        value={pendingOrderFilters.mfg}
                        onChange={(e) => setPendingOrderFilters({ ...pendingOrderFilters, mfg: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Clear Button */}
                    <button
                      onClick={() => clearFilters('pendingOrders')}
                      className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-sm transition"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Filtered Orders */}
              {[...data.pendingSauda]
                .filter((s) => {
                  // Calculate fulfillment percentage
                  const qtyOrdered = s.ordered || 0;
                  const qtySent = s.sent || 0;
                  const fulfillmentPercent = qtyOrdered > 0 ? Math.round((qtySent / qtyOrdered) * 100) : 0;

                  // Apply fulfillment threshold filter (show only < threshold)
                  if (fulfillmentPercent >= pendingOrderFilters.fulfillmentThreshold) {
                    return false;
                  }

                  // Apply buyer filter
                  if (pendingOrderFilters.buyer && !s.buyer.toLowerCase().includes(pendingOrderFilters.buyer.toLowerCase())) {
                    return false;
                  }

                  // Apply manufacturer filter
                  if (pendingOrderFilters.mfg && !s.mfg.toLowerCase().includes(pendingOrderFilters.mfg.toLowerCase())) {
                    return false;
                  }

                  return true;
                })
                .sort((a, b) => {
                  // Sort by sauda number descending (latest first)
                  const numA = parseInt(a.id.replace(/[^\d]/g, ''), 10) || 0;
                  const numB = parseInt(b.id.replace(/[^\d]/g, ''), 10) || 0;
                  return numB - numA;
                })
                .map((s, i) => {
                  // Calculate fulfillment percentage using Firebase field names
                  const qtyOrdered = s.ordered || 0;
                  const qtySent = s.sent || 0;
                  const qtyPending = Math.abs(qtyOrdered - qtySent); // Calculate from ordered - sent
                  const fulfillmentPercent = qtyOrdered > 0 ? Math.round((qtySent / qtyOrdered) * 100) : 0;

                  return (
                    <Card key={i} className="p-4">
                      <div className="flex justify-between mb-3">
                        <span className="bg-slate-800 text-white text-xs px-2 py-1 rounded font-bold">#{s.id}</span>
                        <span className="text-xs text-slate-500">{s.date}</span>
                      </div>

                      <h4 className="font-bold mb-2 text-slate-900">{s.quality}</h4>

                      {/* Buyer & Mfg Info */}
                      <div className="space-y-1 mb-3 pb-3 border-b border-slate-200">
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Buyer</span>
                          <span className="font-black text-sm text-slate-900">{s.buyer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Mfg</span>
                          <span className="font-black text-sm text-slate-900">{s.mfg}</span>
                        </div>
                      </div>

                      {/* Quantity Metrics */}
                      {(s.ordered || s.sent) && (
                        <div className="space-y-2 mb-3 pb-3 border-b border-slate-200 bg-blue-50 p-2 rounded">
                          {s.ordered && (
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-600">Qty Ordered</span>
                              <span className="font-bold text-slate-800">{s.ordered.toLocaleString()} {s.unit}</span>
                            </div>
                          )}
                          {s.sent && (
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-600">Qty Sent</span>
                              <span className="font-bold text-green-700">{s.sent.toLocaleString()} {s.unit}</span>
                            </div>
                          )}
                          {qtyOrdered > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-600">Qty Pending</span>
                              <span className="font-bold text-orange-700">{qtyPending.toLocaleString()} {s.unit}</span>
                            </div>
                          )}

                          {/* Fulfillment Progress */}
                          {s.ordered && (
                            <div className="mt-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold text-slate-700">Fulfillment</span>
                                <span className={`text-xs font-bold ${fulfillmentPercent < pendingOrderFilters.fulfillmentThreshold ? 'text-red-600' : 'text-blue-600'}`}>
                                  {fulfillmentPercent}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-300 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full transition-all duration-300 bg-green-500"
                                  style={{ width: `${Math.min(fulfillmentPercent, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pending Status Card */}
                      <div className="bg-orange-50 p-2 rounded border border-orange-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-orange-700">PENDING</span>
                        <span className="font-bold text-orange-700">
                          {qtyPending} {s.unit}
                        </span>
                      </div>
                    </Card>
                  );
                })}

              {[...data.pendingSauda].filter((s) => {
                const qtyOrdered = s.ordered || 0;
                const qtySent = s.sent || 0;
                const fulfillmentPercent = qtyOrdered > 0 ? Math.round((qtySent / qtyOrdered) * 100) : 0;
                if (fulfillmentPercent >= pendingOrderFilters.fulfillmentThreshold) return false;
                if (pendingOrderFilters.buyer && !s.buyer.toLowerCase().includes(pendingOrderFilters.buyer.toLowerCase())) return false;
                if (pendingOrderFilters.mfg && !s.mfg.toLowerCase().includes(pendingOrderFilters.mfg.toLowerCase())) return false;
                return true;
              }).length === 0 && (
                <div className="text-center text-slate-400 mt-10 bg-slate-50 p-8 rounded">
                  <AlertCircle size={32} className="mx-auto mb-2 text-slate-300" />
                  <p>No pending orders found matching your filters</p>
                  {(pendingOrderFilters.buyer || pendingOrderFilters.mfg || pendingOrderFilters.fulfillmentThreshold !== 95) && (
                    <p className="text-xs mt-2">Try adjusting your filter criteria</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden bg-white border-t p-2 flex justify-between">
          {[
            { id: 'dashboard', icon: Home, label: 'Home' },
            { id: 'pending', icon: Clock, label: 'Orders' },
            { id: 'invoices', icon: FileText, label: 'Invoices' },
            { id: 'buyerAgeing', icon: Users, label: 'Buyers' }
          ].map((x) => (
            <button
              key={x.id}
              onClick={() => handleTabChange(x.id)}
              className={`flex flex-col items-center w-full ${
                activeTab === x.id ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <x.icon size={20} />
              <span className="text-[10px] font-bold mt-1">{x.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

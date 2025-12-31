import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Factory, 
  Clock, 
  CheckCircle, 
  FileText, 
  Search, 
  Upload,
  Filter, 
  Calendar, 
  Home, 
  ChevronDown, 
  X, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeft,
  CloudLightning,
  RefreshCw,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = 'c_d7a58a78b230c278_TextileApp.jsx-139';

// --- COMPONENTS ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    slate: "bg-slate-100 text-slate-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// --- MAIN APP ---
export default function TextileApp() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // --- LIVE DATA STATE ---
  const [data, setData] = useState({
    buyerAgeing: [],
    mfgAgeing: [],
    pendingSauda: [],
    completedSauda: [],
    invoices: []
  });
  
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [drillDownFilter, setDrillDownFilter] = useState(null);
    
  // FILTERS
  const [invoiceFilters, setInvoiceFilters] = useState({ status: 'ALL', buyer: '', mfg: '', ageingType: 'ALL' });
  const [saudaFilters, setSaudaFilters] = useState({ buyer: '', mfg: '', unit: '', sortBy: 'id' });
  const [ageingFilters, setAgeingFilters] = useState({ minTotal: '', hasOverdue: false, sortBy: 'total' });

  // --- AUTH SETUP ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth failed:", error);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // --- FIREBASE SYNC ---
  useEffect(() => {
    if (!user) return;

    let unsubs = [];
    setLoading(true);

    const getPath = (colName) => collection(db, 'artifacts', appId, 'public', 'data', colName);
    const cleanData = (snapshot) => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const handleError = (err) => {
      console.error("Firestore Error:", err);
      if (err.code === 'permission-denied') {
        setPermissionError(true);
        setLoading(false);
      }
    };

    try {
      unsubs.push(onSnapshot(query(getPath('invoices')), (snap) => {
        setData(prev => ({ ...prev, invoices: cleanData(snap) }));
      }, handleError));

      unsubs.push(onSnapshot(query(getPath('sauda_pending')), (snap) => {
        setData(prev => ({ ...prev, pendingSauda: cleanData(snap) }));
      }, handleError));

      unsubs.push(onSnapshot(query(getPath('sauda_completed')), (snap) => {
        setData(prev => ({ ...prev, completedSauda: cleanData(snap) }));
      }, handleError));

      unsubs.push(onSnapshot(query(getPath('ageing_buyer')), (snap) => {
        setData(prev => ({ ...prev, buyerAgeing: cleanData(snap) }));
      }, handleError));

      unsubs.push(onSnapshot(query(getPath('ageing_mfg')), (snap) => {
        setData(prev => ({ ...prev, mfgAgeing: cleanData(snap) }));
        setLoading(false);
      }, handleError));
    } catch (error) {
      console.error("Setup error:", error);
      setPermissionError(true);
      setLoading(false);
    }

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [user]);

  // --- HELPERS ---
  const clearFilters = (type) => {
    if (type === 'invoice') {
      setInvoiceFilters({ status: 'ALL', buyer: '', mfg: '', ageingType: 'ALL' });
      setDrillDownFilter(null);
    } else if (type === 'sauda') {
      setSaudaFilters({ buyer: '', mfg: '', unit: '', sortBy: 'id' });
    } else if (type === 'ageing') {
      setAgeingFilters({ minTotal: '', hasOverdue: false, sortBy: 'total' });
    }
  };

  const handleAgeingClick = (firm, bucket, type) => {
    setDrillDownFilter({ firm, bucket, type });
    setActiveTab('invoices');
    setInvoiceFilters({ status: 'ALL', buyer: '', mfg: '', ageingType: 'ALL' }); 
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setShowFilters(false);
    if (tab !== 'invoices') setDrillDownFilter(null);
  };

  const copyAppId = () => {
    // navigator.clipboard.writeText may not work in iframe, using fallback
    try {
        const textArea = document.createElement("textarea");
        textArea.value = appId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        // Using a simpler notification since alert might be blocked or annoying
        console.log("App ID copied");
    } catch (e) {
        console.error("Copy failed", e);
    }
  };

  // Dropdown Data
  const invoiceBuyers = useMemo(() => [...new Set(data.invoices.map(i => i.buyer))].sort(), [data.invoices]);
  const invoiceMfgs = useMemo(() => [...new Set(data.invoices.map(i => i.mfg))].sort(), [data.invoices]);

  // Stats
  const stats = useMemo(() => {
    const totalBuyerDue = data.buyerAgeing.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    const totalMfgDue = data.mfgAgeing.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    const pendingOrders = data.pendingSauda.length;
    const completedOrders = data.completedSauda.length;
    const overdueInvoices = data.invoices.filter(inv => inv.ageing > 0 && inv.status === 'UNPAID').length;
    return { totalBuyerDue, totalMfgDue, pendingOrders, completedOrders, overdueInvoices };
  }, [data]);

  // --- RENDER FUNCTIONS ---

  const renderDashboard = () => (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* App ID Widget for Sync Setup */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full text-blue-600"><CloudLightning size={20}/></div>
          <div>
            <h4 className="font-bold text-blue-900 text-sm">Connect Live Data</h4>
            <p className="text-xs text-blue-700">Paste this ID into your <code>sync_drive.py</code> file.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-blue-200 w-full md:w-auto">
          <code className="text-xs font-mono text-slate-600 truncate flex-1">{appId}</code>
          <button onClick={copyAppId} className="text-blue-600 hover:text-blue-800"><Copy size={16}/></button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex justify-between items-start mb-2">
            <div className="text-xs text-slate-500 font-semibold uppercase">Receivables</div>
            <Users className="text-green-200" size={20} />
          </div>
          <div className="text-xl font-bold text-slate-800">{formatCurrency(stats.totalBuyerDue)}</div>
          <div className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp size={12} /> From buyers</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex justify-between items-start mb-2">
            <div className="text-xs text-slate-500 font-semibold uppercase">Payables</div>
            <Factory className="text-red-200" size={20} />
          </div>
          <div className="text-xl font-bold text-slate-800">{formatCurrency(stats.totalMfgDue)}</div>
          <div className="text-xs text-red-600 mt-1 flex items-center gap-1"><TrendingDown size={12} /> To manufacturers</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start mb-2">
            <div className="text-xs text-slate-500 font-semibold uppercase">Net Flow</div>
            <LayoutDashboard className="text-blue-200" size={20} />
          </div>
          <div className={`text-xl font-bold ${stats.totalBuyerDue - stats.totalMfgDue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(stats.totalBuyerDue - stats.totalMfgDue)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Net position</div>
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

      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><div className="text-2xl font-bold text-slate-800">{stats.completedOrders}</div><div className="text-xs text-slate-500">Completed</div></div>
          <div><div className="text-2xl font-bold text-red-600">{stats.overdueInvoices}</div><div className="text-xs text-slate-500">Overdue</div></div>
          <div><div className="text-2xl font-bold text-slate-800">{data.invoices.length}</div><div className="text-xs text-slate-500">Invoices</div></div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users size={16} className="text-red-500" /> Top Dues</h3>
          <button onClick={() => setActiveTab('buyerAgeing')} className="text-xs text-blue-600">View All</button>
        </div>
        <div className="divide-y divide-slate-100">
          {data.buyerAgeing.slice(0, 5).map((item, idx) => (
            <div key={idx} className="p-3 flex justify-between items-center">
              <div className="overflow-hidden">
                <p className="font-medium text-slate-800 text-sm truncate">{item.firm}</p>
                {item.days60plus > 0 && <span className="text-xs text-red-600">60+: {formatCurrency(item.days60plus)}</span>}
              </div>
              <span className="font-bold text-slate-700 text-sm">{formatCurrency(item.total)}</span>
            </div>
          ))}
          {data.buyerAgeing.length === 0 && <div className="p-4 text-center text-slate-400 text-sm">No data available</div>}
        </div>
      </Card>
    </div>
  );

  const renderInvoices = () => {
    let filtered = data.invoices.filter(inv => {
      if (drillDownFilter) {
        const matchesFirm = drillDownFilter.type === 'Buyer' ? inv.buyer === drillDownFilter.firm : inv.mfg === drillDownFilter.firm;
        if (!matchesFirm) return false;
        if (drillDownFilter.bucket === 'notDue') return inv.ageing <= 0;
        if (drillDownFilter.bucket === 'days0_7') return inv.ageing > 0 && inv.ageing <= 7;
        if (drillDownFilter.bucket === 'days8_30') return inv.ageing >= 8 && inv.ageing <= 30;
        if (drillDownFilter.bucket === 'days60plus') return inv.ageing > 60;
        return true; 
      }

      const matchesSearch = inv.buyer?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            inv.invoice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            inv.mfg?.toLowerCase().includes(searchTerm.toLowerCase());
       
      let matchesStatus = true;
      if (invoiceFilters.status !== 'ALL') {
        if (invoiceFilters.status === 'OTHER') matchesStatus = !['PAID', 'UNPAID', 'RETURN'].includes(inv.status) && !inv.isReturn;
        else if (invoiceFilters.status === 'RETURN') matchesStatus = inv.isReturn;
        else matchesStatus = inv.status === invoiceFilters.status;
      }

      let matchesAgeing = true;
      if (invoiceFilters.ageingType === 'OVERDUE') matchesAgeing = inv.ageing > 0 && inv.status === 'UNPAID';
      else if (invoiceFilters.ageingType === 'UPCOMING') matchesAgeing = inv.ageing <= 0 && inv.status === 'UNPAID';

      return matchesSearch && matchesStatus && matchesAgeing && 
             (!invoiceFilters.buyer || inv.buyer === invoiceFilters.buyer) && 
             (!invoiceFilters.mfg || inv.mfg === invoiceFilters.mfg);
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
          <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
            <button onClick={() => setDrillDownFilter(null)}><ArrowLeft size={18} /></button>
            <span className="font-bold text-sm">
              {drillDownFilter.firm} ({drillDownFilter.bucket.replace('days', '').replace('plus', '+').replace('_', '-')})
            </span>
            <button onClick={() => setDrillDownFilter(null)} className="ml-auto"><X size={16}/></button>
          </div>
        )}

        {!drillDownFilter && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search invoices..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-blue-600" /><span className="font-medium text-slate-700">Filters</span>
              </div>
              <ChevronDown className={`text-slate-400 ${showFilters ? 'rotate-180' : ''}`} size={20} />
            </button>
          </>
        )}

        {showFilters && !drillDownFilter && (
          <Card className="p-4 space-y-4">
             <div>
                <label className="text-xs font-bold text-slate-500">STATUS</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['ALL', 'UNPAID', 'PAID'].map(s => (
                    <button key={s} onClick={() => setInvoiceFilters(p =>({...p, status: s}))} className={`px-3 py-1 rounded text-xs border ${invoiceFilters.status === s ? 'bg-blue-600 text-white' : 'bg-white'}`}>{s}</button>
                  ))}
                </div>
             </div>
             <div className="grid grid-cols-2 gap-2">
                <select className="p-2 border rounded text-xs" value={invoiceFilters.buyer} onChange={e=>setInvoiceFilters(p=>({...p, buyer: e.target.value}))}>
                   <option value="">All Buyers</option>{invoiceBuyers.map(b=><option key={b} value={b}>{b}</option>)}
                </select>
                <select className="p-2 border rounded text-xs" value={invoiceFilters.mfg} onChange={e=>setInvoiceFilters(p=>({...p, mfg: e.target.value}))}>
                   <option value="">All Mfg</option>{invoiceMfgs.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
             </div>
             <button onClick={() => clearFilters('invoice')} className="text-xs text-red-600 w-full text-center mt-2">Clear Filters</button>
          </Card>
        )}

        <div className="space-y-3">
          {filtered.map((inv, idx) => {
            const isOverdue = inv.ageing > 0 && inv.status === 'UNPAID';
            const isPaid = inv.status === 'PAID';
            const statusColor = isPaid ? 'green' : (inv.isReturn ? 'purple' : (isOverdue ? 'red' : 'blue'));
            
            return (
              <Card key={idx} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-lg">#{inv.invoice}</span>
                      <Badge color={statusColor}>{inv.status}</Badge>
                    </div>
                    <div className="text-xs text-slate-500 mt-1"><Calendar size={12} className="inline mr-1"/>{inv.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-slate-800">{formatCurrency(inv.amount)}</div>
                    {!isPaid && !inv.isReturn && (
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

  const renderAgeingList = (listData, type) => {
    let filtered = listData.filter(item => item.firm.toLowerCase().includes(searchTerm.toLowerCase()));
    if(ageingFilters.minTotal) filtered = filtered.filter(i => i.total >= ageingFilters.minTotal);
    if(ageingFilters.hasOverdue) filtered = filtered.filter(i => i.days60plus > 0);
    
    // Sort logic
    if (ageingFilters.sortBy === 'firm') filtered.sort((a,b)=>a.firm.localeCompare(b.firm));
    else if (ageingFilters.sortBy === 'overdue') filtered.sort((a,b)=>b.days60plus - a.days60plus);
    else filtered.sort((a,b)=>b.total - a.total);

    return (
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder={`Search ${type}...`} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="space-y-3">
          {filtered.map((row, i) => (
            <Card key={i} className="p-4">
               <div className="flex justify-between border-b pb-2 mb-2">
                  <span className="font-bold text-lg">{row.firm}</span>
                  <span className="font-bold text-blue-600 text-lg">{formatCurrency(row.total)}</span>
               </div>
               <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div onClick={()=>handleAgeingClick(row.firm, 'notDue', type)} className="p-2 bg-green-50 rounded cursor-pointer border border-green-100 hover:bg-green-100">
                     <div className="text-green-700 font-bold">Not Due</div>
                     <div>{formatCurrency(row.notDue)}</div>
                  </div>
                  <div onClick={()=>handleAgeingClick(row.firm, 'days0_7', type)} className="p-2 bg-blue-50 rounded cursor-pointer border border-blue-100 hover:bg-blue-100">
                     <div className="text-blue-700 font-bold">0-7 Days</div>
                     <div>{formatCurrency(row.days0_7)}</div>
                  </div>
                  <div onClick={()=>handleAgeingClick(row.firm, 'days8_30', type)} className="p-2 bg-orange-50 rounded cursor-pointer border border-orange-100 hover:bg-orange-100">
                     <div className="text-orange-700 font-bold">8-30 Days</div>
                     <div>{formatCurrency(row.days8_30)}</div>
                  </div>
                  <div onClick={()=>handleAgeingClick(row.firm, 'days60plus', type)} className={`p-2 rounded cursor-pointer border hover:bg-opacity-80 ${row.days60plus > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                     <div className={`${row.days60plus > 0 ? 'text-red-700' : 'text-slate-500'} font-bold`}>60+ Days</div>
                     <div>{formatCurrency(row.days60plus)}</div>
                  </div>
               </div>
            </Card>
          ))}
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
            The App cannot read the database. This usually means the <strong>Firestore Security Rules</strong> are locking it out.
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
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
      <div className="text-center">
        <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-2 text-blue-500"/>
        <p>Syncing Live Data...</p>
      </div>
    </div>;
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
              {id:'dashboard', l:'Dashboard', icon: Home}, 
              {id:'pending', l:'Pending Orders', icon: Clock}, 
              {id:'invoices', l:'Invoices', icon: FileText}, 
              {id:'buyerAgeing', l:'Buyer Ageing', icon: Users}, 
              {id:'mfgAgeing', l:'Mfg Ageing', icon: Factory}
            ].map(i => (
              <button 
                key={i.id} 
                onClick={()=>handleTabChange(i.id)} 
                className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab===i.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <i.icon size={18} />
                {i.l}
              </button>
            ))}
         </div>
         <div className="p-4 border-t text-xs text-slate-400">
            App ID: {appId.slice(0,8)}...
         </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 border-b flex justify-between items-center sticky top-0 z-10">
           <span className="font-bold text-lg flex items-center gap-2"><LayoutDashboard className="text-blue-600"/> TextileHub</span>
           {activeTab === 'dashboard' && <CloudLightning size={20} className="text-green-500"/>}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           {activeTab === 'dashboard' && renderDashboard()}
           {activeTab === 'invoices' && renderInvoices()}
           {activeTab === 'buyerAgeing' && renderAgeingList(data.buyerAgeing, "Buyer")}
           {activeTab === 'mfgAgeing' && renderAgeingList(data.mfgAgeing, "Manufacturer")}
           {activeTab === 'pending' && <div className="space-y-3">{data.pendingSauda.map((s, i) => (
              <Card key={i} className="p-4">
                 <div className="flex justify-between mb-2">
                    <span className="bg-slate-800 text-white text-xs px-2 py-1 rounded">#{s.id}</span>
                    <span className="text-xs text-slate-500">{s.date}</span>
                 </div>
                 <h4 className="font-bold mb-2">{s.quality}</h4>
                 <div className="space-y-1 mb-3">
                    <div className="flex justify-between"><span className="text-xs text-slate-500">Buyer</span><span className="font-black text-sm text-slate-900">{s.buyer}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-slate-500">Mfg</span><span className="font-black text-sm text-slate-900">{s.mfg}</span></div>
                 </div>
                 <div className="bg-orange-50 p-2 rounded border border-orange-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-orange-700">PENDING</span>
                    <span className="font-bold text-orange-700">{s.pending} {s.unit}</span>
                 </div>
              </Card>
           ))}
           {data.pendingSauda.length === 0 && <div className="text-center text-slate-400 mt-10">No pending orders</div>}
           </div>}
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden bg-white border-t p-2 flex justify-between safe-area-pb">
           {[{id:'dashboard', i:Home, l:'Home'}, {id:'pending', i:Clock, l:'Orders'}, {id:'invoices', i:FileText, l:'Invoices'}, {id:'buyerAgeing', i:Users, l:'Buyers'}].map(x => (
              <button key={x.id} onClick={()=>handleTabChange(x.id)} className={`flex flex-col items-center w-full ${activeTab===x.id ? 'text-blue-600' : 'text-slate-400'}`}>
                 <x.i size={20} />
                 <span className="text-[10px] font-bold mt-1">{x.l}</span>
              </button>
           ))}
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Filter,
  AlertCircle,
  TrendingUp,
  Calendar,
  Users,
  Factory,
  Package,
  Clock,
  AlertTriangle,
  IndianRupee,
  Download
} from 'lucide-react';
import { useInvoiceReports, useOrderReports, formatCurrency, exportToCSV, exportReportToCSV, exportReportToPDF, exportInvoiceToPDF } from '@/lib/hooks/useReports';
import { Card, Badge } from '@/components/Dashboard';
import ExportModal from '@/components/ExportModal';

type ReportType = 'invoices' | 'orders';
type GroupByType = 'buyer' | 'mfg' | 'all';
type InvoiceFilterType = 'overdue' | 'dueToday' | 'dueSoon' | 'all';
type InvoiceStatusType = 'all' | 'paid' | 'unpaid';
type PaymentTypeFilterType = 'all' | 'cash' | 'gst';
type OrderStatusType = 'pending' | 'completed' | 'all';
type InvoiceViewType = 'summary' | 'details';

export default function ReportsModule() {
  const [reportType, setReportType] = useState<ReportType>('invoices');
  const [groupBy, setGroupBy] = useState<GroupByType>('all');
  const [invoiceFilter, setInvoiceFilter] = useState<InvoiceFilterType>('all');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<InvoiceStatusType>('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<PaymentTypeFilterType>('all');
  const [orderStatus, setOrderStatus] = useState<OrderStatusType>('all');
  const [selectedBuyer, setSelectedBuyer] = useState<string>('');
  const [selectedMfg, setSelectedMfg] = useState<string>('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [invoiceView, setInvoiceView] = useState<InvoiceViewType>('summary');
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const invoiceReports = useInvoiceReports(groupBy, invoiceFilter, selectedBuyer, selectedMfg, paymentTypeFilter, invoiceStatusFilter);
  const orderReports = useOrderReports(groupBy, orderStatus, selectedBuyer, selectedMfg);

  const isLoading = reportType === 'invoices' ? invoiceReports.loading : orderReports.loading;
  const error = reportType === 'invoices' ? invoiceReports.error : orderReports.error;
  const data = reportType === 'invoices' ? invoiceReports.data : orderReports.data;

  // Handle Apply Filters - just refreshes data, doesn't export
  const handleApplyFilters = () => {
    // Data is automatically updated by the hooks due to dependency changes
    console.log('Filters applied - data is now filtered');
  };

  // Handle CSV Export
  const handleCSVExport = () => {
    if (!data) return;
    setIsExporting(true);

    try {
      if (reportType === 'invoices' && invoiceView === 'details') {
        // Export invoice details
        const allInvoices: any[] = [];
        let srNumber = 1;
        Object.values(data.buyerWise || {}).forEach((report: any) => {
          report.invoices?.forEach((inv: any) => {
            const creditPeriod = calculateCreditPeriod(inv.date, inv.due);
            allInvoices.push({
              'SR': srNumber++,
              'Invoice Number': inv.invoice,
              'Invoice Date': inv.date,
              'Mfg Firm': inv.mfg,
              'Credit Period (Days)': creditPeriod,
              'Due Date': inv.due,
              'Net Amount': inv.amount,
              'Payment Type': inv.payment_type || 'N/A',
              'Status': inv.status,
              'Buyer': inv.buyer,
              'Ageing (Days)': inv.ageing
            });
          });
        });
        exportToCSV(allInvoices, 'invoice-details');
      } else {
        const exportData =
          reportType === 'invoices'
            ? Object.values(data.buyerWise || {}).flatMap((report: any) => [
                {
                  Type: 'Buyer',
                  Name: report.buyer,
                  'Total Invoices': report.totalInvoices,
                  'Total Amount': report.totalAmount,
                  'Paid Amount': report.totalPaid,
                  'Unpaid Amount': report.totalUnpaid,
                  'Overdue Amount': report.overdueAmount,
                  'Due Today': report.dueToday,
                  'Due Soon': report.dueSoon
                }
              ])
            : Object.values(data.buyerWise || {}).flatMap((report: any) => [
                {
                  Type: 'Buyer',
                  Name: report.buyer,
                  'Total Orders': report.totalOrders,
                  'Total Quantity': report.totalQuantity,
                  Unit: report.unit
                }
              ]);

        exportReportToCSV(exportData, `${reportType}-report`);
      }
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle PDF Export
  const handlePDFExport = async () => {
    if (!data) return;
    setIsExporting(true);

    try {
      if (reportType === 'invoices' && invoiceView === 'details') {
        // Export invoice details to PDF
        const allInvoices: any[] = [];
        Object.values(data.buyerWise || {}).forEach((report: any) => {
          report.invoices?.forEach((inv: any) => {
            allInvoices.push(inv);
          });
        });
        await exportInvoiceToPDF(allInvoices, 'invoice-details', 'Invoice Details Report');
      } else {
        const exportData =
          reportType === 'invoices'
            ? Object.values(data.buyerWise || {}).flatMap((report: any) => [
                {
                  Buyer: report.buyer,
                  'Total Invoices': report.totalInvoices,
                  'Total Amount': formatCurrency(report.totalAmount),
                  'Paid Amount': formatCurrency(report.totalPaid),
                  'Unpaid Amount': formatCurrency(report.totalUnpaid),
                  'Overdue Amount': formatCurrency(report.overdueAmount),
                  'Due Today': formatCurrency(report.dueToday),
                  'Due Soon': formatCurrency(report.dueSoon)
                }
              ])
            : Object.values(data.buyerWise || {}).flatMap((report: any) => [
                {
                  Buyer: report.buyer,
                  'Total Orders': report.totalOrders,
                  'Total Quantity': report.totalQuantity,
                  Unit: report.unit
                }
              ]);

        const headers = Object.keys(exportData[0] || {});
        await exportReportToPDF(
          exportData,
          headers,
          `${reportType}-report`,
          `${reportType === 'invoices' ? 'Invoice' : 'Order'} Report`
        );
      }
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate credit period in days
  const calculateCreditPeriod = (invoiceDate: string, dueDate: string): number => {
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
  };

  // Get unique buyers and manufacturers from data
  const buyers = data ? [...new Set(Object.values(data.buyerWise || {}).map((r: any) => r.buyer))] : [];
  const manufacturers = data ? [...new Set(Object.values(data.mfgWise || {}).map((r: any) => r.mfg))] : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 size={24} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
      </div>

      {/* Report Type Selection */}
      <div className="flex gap-2 flex-wrap">
        {(['invoices', 'orders'] as const).map((type) => (
          <button
            key={type}
            onClick={() => {
              setReportType(type);
              setGroupBy('all');
              setInvoiceView('summary');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              reportType === type
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300'
            }`}
          >
            {type === 'invoices' ? 'Invoice Reports' : 'Order Reports'}
          </button>
        ))}
      </div>

      {/* Invoice View Toggle (only for invoices) */}
      {reportType === 'invoices' && (
        <div className="flex gap-2">
          <button
            onClick={() => setInvoiceView('summary')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              invoiceView === 'summary'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300'
            }`}
          >
            Summary Report
          </button>
          <button
            onClick={() => setInvoiceView('details')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              invoiceView === 'details'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300'
            }`}
          >
            Invoice Details
          </button>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-blue-600" />
          <h3 className="font-bold text-slate-800">Filters</h3>
        </div>

        {/* Invoice Specific Filters */}
        {reportType === 'invoices' && (
          <div className="space-y-6">
            {/* Section 1: DUE DATE FILTERS */}
            <div className="pb-4 border-b border-slate-300">
              <label className="text-xs font-bold text-slate-600 block mb-3">DUE DATE FILTERS</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setInvoiceFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    invoiceFilter === 'all'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-green-400'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setInvoiceFilter('overdue')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    invoiceFilter === 'overdue'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-green-400'
                  }`}
                >
                  Overdue
                </button>
                <button
                  onClick={() => setInvoiceFilter('dueToday')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    invoiceFilter === 'dueToday'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-green-400'
                  }`}
                >
                  Due Today
                </button>
                <button
                  onClick={() => setInvoiceFilter('dueSoon')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    invoiceFilter === 'dueSoon'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-green-400'
                  }`}
                >
                  Due in 1-3 Days
                </button>
              </div>
            </div>

            {/* Section 2: STATUS FILTERS */}
            <div className="pb-4 border-b border-slate-300">
              <label className="text-xs font-bold text-slate-600 block mb-3">STATUS</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setInvoiceStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    invoiceStatusFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-400'
                  }`}
                >
                  ALL
                </button>
                <button
                  onClick={() => setInvoiceStatusFilter('unpaid')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    invoiceStatusFilter === 'unpaid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-400'
                  }`}
                >
                  UNPAID
                </button>
                <button
                  onClick={() => setInvoiceStatusFilter('paid')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    invoiceStatusFilter === 'paid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-400'
                  }`}
                >
                  PAID
                </button>
              </div>
            </div>

            {/* Section 3: PAYMENT TYPE FILTERS - CRITICAL SECTION */}
            <div className="pb-4 border-b border-slate-300 bg-purple-50 p-3 rounded-lg">
              <label className="text-xs font-bold text-purple-700 block mb-3 uppercase">💳 PAYMENT TYPE</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setPaymentTypeFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    paymentTypeFilter === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-slate-700 border-2 border-purple-400 hover:bg-purple-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPaymentTypeFilter('cash')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    paymentTypeFilter === 'cash'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-slate-700 border-2 border-purple-400 hover:bg-purple-100'
                  }`}
                >
                  💰 Cash Invoice
                </button>
                <button
                  onClick={() => setPaymentTypeFilter('gst')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    paymentTypeFilter === 'gst'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-slate-700 border-2 border-purple-400 hover:bg-purple-100'
                  }`}
                >
                  📄 GST Invoice
                </button>
              </div>
            </div>

            {/* Section 4: BUYER & MFG DROPDOWNS */}
            <div className="pb-4 border-b border-slate-300">
              <label className="text-xs font-bold text-slate-600 block mb-3">SELECT FILTERS</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">BUYER</label>
                  <select
                    value={selectedBuyer}
                    onChange={(e) => setSelectedBuyer(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Buyers</option>
                    {buyers.map((buyer) => (
                      <option key={buyer} value={buyer}>
                        {buyer}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">MFG</label>
                  <select
                    value={selectedMfg}
                    onChange={(e) => setSelectedMfg(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Mfg</option>
                    {manufacturers.map((mfg) => (
                      <option key={mfg} value={mfg}>
                        {mfg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 5: ACTION BUTTONS */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleApplyFilters}
                disabled={!data}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setInvoiceFilter('all');
                  setInvoiceStatusFilter('all');
                  setPaymentTypeFilter('all');
                  setSelectedBuyer('');
                  setSelectedMfg('');
                  setGroupBy('all');
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Order Specific Filters */}
        {reportType === 'orders' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">BUYER</label>
                <select
                  value={selectedBuyer}
                  onChange={(e) => setSelectedBuyer(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Buyers</option>
                  {buyers.map((buyer) => (
                    <option key={buyer} value={buyer}>
                      {buyer}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">MFG</label>
                <select
                  value={selectedMfg}
                  onChange={(e) => setSelectedMfg(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Mfg</option>
                  {manufacturers.map((mfg) => (
                    <option key={mfg} value={mfg}>
                      {mfg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">ORDER STATUS</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as OrderStatusType)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending Only</option>
                  <option value="completed">Completed Only</option>
                </select>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2 pt-3">
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setOrderStatus('all');
                  setSelectedBuyer('');
                  setSelectedMfg('');
                  setGroupBy('all');
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Error State */}
      {error && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            <div>
              <h4 className="font-bold text-red-800">Error Loading Reports</h4>
              <p className="text-sm text-red-700">{error}</p>
              <p className="text-xs text-red-600 mt-2">Troubleshooting: Check Firebase connection and ensure you are authenticated.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="p-8 text-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <BarChart3 size={32} className="text-slate-400" />
            <p className="text-slate-500 font-medium">Fetching live data from Firebase...</p>
          </div>
        </Card>
      )}

      {/* Debug Info - Show when no data loaded and no error */}
      {!isLoading && !error && !data && (
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>No data available.</strong> Make sure your Firebase database has invoices or orders in the configured collections. 
            Check browser console for details.
          </p>
        </Card>
      )}

      {/* Summary Stats */}
      {data && !isLoading && (
        <>
          {reportType === 'invoices' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SummaryCard
                icon={<Package size={20} className="text-blue-600" />}
                label="Total Invoices"
                value={(data.summary as any).totalInvoices}
                color="blue"
              />
              <SummaryCard
                icon={<IndianRupee size={20} className="text-green-600" />}
                label="Total Amount"
                value={formatCurrency((data.summary as any).totalAmount)}
                color="green"
              />
              <SummaryCard
                icon={<AlertTriangle size={20} className="text-red-600" />}
                label="Overdue"
                value={formatCurrency((data.summary as any).totalOverdue)}
                color="red"
              />
              <SummaryCard
                icon={<Clock size={20} className="text-yellow-600" />}
                label="Due Soon"
                value={formatCurrency((data.summary as any).totalDueSoon)}
                color="yellow"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SummaryCard
                icon={<Package size={20} className="text-blue-600" />}
                label="Total Orders"
                value={(data.summary as any).totalOrders}
                color="blue"
              />
              <SummaryCard
                icon={<TrendingUp size={20} className="text-green-600" />}
                label="Total Quantity"
                value={(data.summary as any).totalQuantity}
                color="green"
              />
              <SummaryCard
                icon={<Users size={20} className="text-purple-600" />}
                label="Total Buyers"
                value={data.summary.totalBuyers}
                color="purple"
              />
              <SummaryCard
                icon={<Factory size={20} className="text-orange-600" />}
                label="Total Mfg"
                value={data.summary.totalMfgs}
                color="orange"
              />
            </div>
          )}

          {/* Export Button and Detailed Reports Section */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-800">Detailed Report</h3>
            <button
              onClick={() => setShowExportModal(true)}
              disabled={!data}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors"
            >
              <Download size={18} />
              Export / Download
            </button>
          </div>

          {/* Detailed Reports - Show only for Summary view */}
          {invoiceView === 'summary' && (
          <div className="space-y-3">

            {groupBy === 'all' || groupBy === 'buyer' ? (
              <div>
                <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Users size={16} /> Buyer-wise Report
                </h4>
                <div className="space-y-2">
                  {Object.entries(data.buyerWise || {}).map(([buyer, report]: any) => (
                    <ReportCard
                      key={buyer}
                      title={buyer}
                      report={report}
                      type={reportType}
                      isExpanded={expandedItem === `buyer-${buyer}`}
                      onToggle={() =>
                        setExpandedItem(
                          expandedItem === `buyer-${buyer}` ? null : `buyer-${buyer}`
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {groupBy === 'all' || groupBy === 'mfg' ? (
              <div>
                <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Factory size={16} /> Manufacturer-wise Report
                </h4>
                <div className="space-y-2">
                  {Object.entries(data.mfgWise || {}).map(([mfg, report]: any) => (
                    <ReportCard
                      key={mfg}
                      title={mfg}
                      report={report}
                      type={reportType}
                      isExpanded={expandedItem === `mfg-${mfg}`}
                      onToggle={() =>
                        setExpandedItem(
                          expandedItem === `mfg-${mfg}` ? null : `mfg-${mfg}`
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          )}

          {/* Invoice Details Table - Show only for Details view */}
          {reportType === 'invoices' && invoiceView === 'details' && (
            <InvoiceDetailsTable 
              data={data} 
              calculateCreditPeriod={calculateCreditPeriod}
            />
          )}
        </>
      )}

      {/* No Data State */}
      {data && !isLoading && Object.keys(data.buyerWise || {}).length === 0 && (
        <Card className="p-8 text-center">
          <Calendar size={32} className="mx-auto text-slate-400 mb-3" />
          <p className="text-slate-500 font-medium">No data available for selected filters</p>
        </Card>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onCSVExport={handleCSVExport}
        onPDFExport={handlePDFExport}
        isLoading={isExporting}
      />
    </div>
  );
}

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

function SummaryCard({ icon, label, value, color }: SummaryCardProps) {
  const bgColorMap: Record<string, string> = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
    yellow: 'bg-yellow-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50'
  };

  return (
    <Card className={`p-3 ${bgColorMap[color] || bgColorMap.blue}`}>
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-xs text-slate-600 font-medium">{label}</p>
      <p className="text-lg font-bold text-slate-800">{value}</p>
    </Card>
  );
}

interface ReportCardProps {
  title: string;
  report: any;
  type: ReportType;
  isExpanded: boolean;
  onToggle: () => void;
}

function ReportCard({ title, report, type, isExpanded, onToggle }: ReportCardProps) {
  // Calculate payment percentage and status
  const paymentPercentage = report.totalAmount > 0 
    ? Math.round((report.totalPaid / report.totalAmount) * 100)
    : 0;

  // Calculate overdue percentage
  const overduePercentage = report.totalUnpaid > 0 
    ? Math.round((report.overdueAmount / report.totalUnpaid) * 100)
    : 0;

  return (
    <Card className="border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="text-left flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-bold text-slate-800">{title}</h5>
            {type === 'invoices' && report.overdueAmount > 0 && (
              <Badge color="red">Overdue</Badge>
            )}
            {type === 'invoices' && report.dueSoon > 0 && (
              <Badge color="yellow">Due Soon</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {type === 'invoices'
              ? `${report.totalInvoices} invoices • ${formatCurrency(report.totalAmount)}`
              : `${report.totalOrders} orders • ${report.totalQuantity} ${report.unit}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {type === 'invoices' && (
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-800">{paymentPercentage}%</p>
              <p className="text-xs text-slate-500">Paid</p>
            </div>
          )}
          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <TrendingUp size={20} className="text-blue-600" />
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-4">
          {type === 'invoices' ? (
            <>
              {/* Payment Analysis */}
              <div>
                <h6 className="text-xs font-bold text-slate-600 uppercase mb-3">Payment Analysis</h6>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <AnalysisBox
                    label="Total Amount"
                    value={formatCurrency(report.totalAmount)}
                    color="blue"
                  />
                  <AnalysisBox
                    label="Paid"
                    value={formatCurrency(report.totalPaid)}
                    color="green"
                    percentage={paymentPercentage}
                  />
                  <AnalysisBox
                    label="Unpaid"
                    value={formatCurrency(report.totalUnpaid)}
                    color="red"
                  />
                  <AnalysisBox
                    label="Outstanding"
                    value={formatCurrency(report.totalUnpaid - report.overdueAmount)}
                    color="purple"
                  />
                </div>
              </div>

              {/* Aging Analysis */}
              <div>
                <h6 className="text-xs font-bold text-slate-600 uppercase mb-3">Aging Analysis</h6>
                <div className="grid grid-cols-3 gap-2">
                  <AnalysisBox
                    label="Overdue"
                    value={formatCurrency(report.overdueAmount)}
                    color="red"
                    percentage={overduePercentage}
                    percentage_label="of unpaid"
                  />
                  <AnalysisBox
                    label="Due Today"
                    value={formatCurrency(report.dueToday)}
                    color="orange"
                  />
                  <AnalysisBox
                    label="Due Soon (1-3d)"
                    value={formatCurrency(report.dueSoon)}
                    color="yellow"
                  />
                </div>
              </div>

              {/* Key Metrics */}
              <div>
                <h6 className="text-xs font-bold text-slate-600 uppercase mb-3">Key Metrics</h6>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <MetricBox
                    label="Avg Invoice Amount"
                    value={formatCurrency(report.totalAmount / report.totalInvoices)}
                  />
                  <MetricBox
                    label="Collection Rate"
                    value={`${paymentPercentage}%`}
                    status={paymentPercentage >= 75 ? 'good' : paymentPercentage >= 50 ? 'warning' : 'critical'}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Order Analysis */}
              <div>
                <h6 className="text-xs font-bold text-slate-600 uppercase mb-3">Order Analysis</h6>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <AnalysisBox
                    label="Total Orders"
                    value={report.totalOrders}
                    color="blue"
                  />
                  <AnalysisBox
                    label="Total Quantity"
                    value={`${report.totalQuantity} ${report.unit}`}
                    color="green"
                  />
                  <AnalysisBox
                    label="Pending"
                    value={report.pending || 0}
                    color="orange"
                  />
                  <AnalysisBox
                    label="Avg Order Size"
                    value={`${Math.round(report.totalQuantity / report.totalOrders)} ${report.unit}`}
                    color="purple"
                  />
                </div>
              </div>

              {/* Order Status */}
              <div>
                <h6 className="text-xs font-bold text-slate-600 uppercase mb-3">Order Status</h6>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <MetricBox
                    label="Orders per Buyer/Mfg"
                    value={report.totalOrders}
                  />
                  <MetricBox
                    label="Total Quantity"
                    value={`${report.totalQuantity} ${report.unit}`}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

interface AnalysisBoxProps {
  label: string;
  value: string | number;
  color: string;
  percentage?: number;
  percentage_label?: string;
}

function AnalysisBox({ label, value, color, percentage, percentage_label }: AnalysisBoxProps) {
  const bgColorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200'
  };

  const textColorMap: Record<string, string> = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    red: 'text-red-700',
    yellow: 'text-yellow-700',
    purple: 'text-purple-700',
    orange: 'text-orange-700'
  };

  return (
    <div className={`p-2 bg-white rounded border ${bgColorMap[color] || bgColorMap.blue}`}>
      <p className="text-xs text-slate-500 font-semibold mb-1">{label}</p>
      <p className={`font-bold ${textColorMap[color] || textColorMap.blue}`}>{value}</p>
      {percentage !== undefined && (
        <p className="text-xs text-slate-600 mt-1">
          {percentage}% {percentage_label ? `(${percentage_label})` : ''}
        </p>
      )}
    </div>
  );
}

interface MetricBoxProps {
  label: string;
  value: string | number;
  status?: 'good' | 'warning' | 'critical';
}

function MetricBox({ label, value, status }: MetricBoxProps) {
  const statusColors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600'
  };

  return (
    <div className="p-2 bg-white rounded border border-slate-200">
      <p className="text-xs text-slate-500 font-semibold mb-1">{label}</p>
      <p className={`font-bold ${status ? statusColors[status] : 'text-slate-800'}`}>{value}</p>
    </div>
  );
}

interface InvoiceDetailsTableProps {
  data: any;
  calculateCreditPeriod: (invoiceDate: string, dueDate: string) => number;
}

function InvoiceDetailsTable({ data, calculateCreditPeriod }: InvoiceDetailsTableProps) {
  // Collect all invoices from buyerWise data
  const allInvoices: any[] = [];
  Object.values(data.buyerWise || {}).forEach((report: any) => {
    report.invoices?.forEach((inv: any) => {
      allInvoices.push(inv);
    });
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'UNPAID':
        return 'bg-red-100 text-red-800';
      case 'RETURN':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Card className="border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <h3 className="font-bold text-slate-800">Invoice Details</h3>
        <p className="text-xs text-slate-600 mt-1">Total Invoices: {allInvoices.length}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Invoice #</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Invoice Date</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Mfg Firm</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Credit Period (Days)</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Due Date</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Net Amount (in Rs.)</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Payment Type</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Ageing (Days)</th>
            </tr>
          </thead>
          <tbody>
            {allInvoices.length > 0 ? (
              allInvoices.map((invoice, idx) => {
                const creditPeriod = calculateCreditPeriod(invoice.date, invoice.due);
                const ageingColor = invoice.ageing > 0 
                  ? 'text-red-600 font-semibold' 
                  : 'text-slate-600';
                const isCashInvoice = invoice.payment_type === 'Cash';
                const rowBgColor = isCashInvoice ? 'bg-blue-50' : 'hover:bg-slate-50';

                return (
                  <tr key={idx} className={`border-b border-slate-200 ${rowBgColor} transition-colors`}>
                    <td className="px-4 py-3 font-medium text-slate-800">{invoice.invoice}</td>
                    <td className="px-4 py-3 text-slate-600">{invoice.date}</td>
                    <td className="px-4 py-3 text-slate-600">{invoice.mfg}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{creditPeriod}</td>
                    <td className="px-4 py-3 text-slate-600">{invoice.due}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      {new Intl.NumberFormat('en-IN').format(invoice.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        isCashInvoice 
                          ? 'bg-blue-200 text-blue-900' 
                          : 'bg-gray-200 text-gray-900'
                      }`}>
                        {invoice.payment_type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-center font-medium ${ageingColor}`}>
                      {invoice.ageing}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                  No invoices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

# Export Feature - Code Reference & Examples

## 1. ExportModal Component Usage

### Import
```typescript
import ExportModal from '@/components/ExportModal';
```

### Props Interface
```typescript
interface ExportModalProps {
  isOpen: boolean;           // Controls visibility
  onClose: () => void;       // Called when modal closes
  onCSVExport: () => void;   // Called when CSV download clicked
  onPDFExport: () => void;   // Called when PDF download clicked
  isLoading?: boolean;       // Shows loading spinner
}
```

### Usage in Component
```typescript
// In state
const [showExportModal, setShowExportModal] = useState(false);
const [isExporting, setIsExporting] = useState(false);

// In JSX
<ExportModal
  isOpen={showExportModal}
  onClose={() => setShowExportModal(false)}
  onCSVExport={handleCSVExport}
  onPDFExport={handlePDFExport}
  isLoading={isExporting}
/>

// Trigger modal
<button onClick={() => setShowExportModal(true)}>
  Export / Download
</button>
```

---

## 2. Export Handler Functions

### CSV Export Handler
```typescript
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
      // Export summary
      const exportData = Object.values(data.buyerWise || {})
        .flatMap((report: any) => [{
          Type: 'Buyer',
          Name: report.buyer,
          'Total Invoices': report.totalInvoices,
          'Total Amount': report.totalAmount,
          // ... more fields
        }]);
      
      exportReportToCSV(exportData, `${reportType}-report`);
    }
    setShowExportModal(false);
  } catch (error) {
    console.error('Error exporting CSV:', error);
  } finally {
    setIsExporting(false);
  }
};
```

### PDF Export Handler
```typescript
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
      await exportInvoiceToPDF(
        allInvoices,
        'invoice-details',
        'Invoice Details Report'
      );
    } else {
      // Export summary to PDF
      const exportData = Object.values(data.buyerWise || {})
        .flatMap((report: any) => ({
          Buyer: report.buyer,
          'Total Invoices': report.totalInvoices,
          'Total Amount': formatCurrency(report.totalAmount),
          // ... more fields
        }));
      
      const headers = Object.keys(exportData[0] || {});
      await exportReportToPDF(
        exportData,
        headers,
        `${reportType}-report`,
        'Invoice Report'
      );
    }
    setShowExportModal(false);
  } catch (error) {
    console.error('Error exporting PDF:', error);
  } finally {
    setIsExporting(false);
  }
};
```

---

## 3. Export Functions from useReports.ts

### exportReportToCSV
```typescript
/**
 * Export reports data (summary/buyer-wise) to CSV
 * @param data - Array of objects to export
 * @param filename - Base filename (date will be appended)
 */
export function exportReportToCSV(data: any[], filename: string) {
  try {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Extract headers from first row
    const headers = Object.keys(data[0]);
    
    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Quote values with commas
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return value;
          })
          .join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
}
```

### exportReportToPDF
```typescript
/**
 * Export reports data to PDF with landscape orientation
 * @param data - Array of objects to export
 * @param headers - Column headers
 * @param filename - Base filename (date will be appended)
 * @param title - PDF title
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

    // Calculate pages (25 rows per page)
    const rowsPerPage = 25;
    const totalPages = Math.ceil(data.length / rowsPerPage);

    // Create landscape PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Process each page
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      const startIdx = page * rowsPerPage;
      const endIdx = Math.min(startIdx + rowsPerPage, data.length);
      const pageData = data.slice(startIdx, endIdx);

      // Create off-screen container
      const pageContainer = document.createElement('div');
      pageContainer.style.padding = '15px';
      pageContainer.style.backgroundColor = 'white';
      pageContainer.style.width = '297mm';
      pageContainer.style.fontFamily = 'Arial, sans-serif';
      pageContainer.style.position = 'absolute';
      pageContainer.style.left = '-9999px';

      // Build header row HTML
      let headerRow = '<tr style="background-color: #1f2937; color: white;">';
      headers.forEach((header) => {
        headerRow += `<th style="border: 1px solid #333; padding: 8px; 
          text-align: left; font-weight: bold; font-size: 11px; 
          word-break: break-word;">${header}</th>`;
      });
      headerRow += '</tr>';

      // Build table HTML
      let pageHTML = `
        <div style="font-family: Arial, sans-serif;">
          ${page === 0 ? `
            <h2 style="text-align: center; margin-bottom: 8px; 
              font-size: 16px; font-weight: bold;">${title}</h2>
            <p style="text-align: right; font-size: 10px; 
              margin-bottom: 12px;">
              Generated on: ${new Date().toLocaleDateString('en-IN')}
            </p>
          ` : ''}
          <table style="width: 100%; border-collapse: collapse;">
            <thead>${headerRow}</thead>
            <tbody>
      `;

      // Add data rows
      pageData.forEach((row, idx) => {
        const rowBgColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
        pageHTML += `<tr style="background-color: ${rowBgColor}; 
          border: 1px solid #ddd;">`;
        
        headers.forEach((header) => {
          const value = row[header];
          const displayValue = typeof value === 'number' 
            ? value.toLocaleString('en-IN') 
            : value;
          pageHTML += `<td style="border: 1px solid #ddd; padding: 6px; 
            font-size: 10px; word-break: break-word;">
            ${displayValue}
          </td>`;
        });
        
        pageHTML += '</tr>';
      });

      pageHTML += `
            </tbody>
          </table>
          <p style="margin-top: 10px; text-align: center; 
            font-size: 10px; color: #666;">
            Page ${page + 1} of ${totalPages}
          </p>
        </div>
      `;

      pageContainer.innerHTML = pageHTML;
      document.body.appendChild(pageContainer);

      // Convert to canvas
      const canvas = await html2canvas(pageContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200
      });

      // Add to PDF
      const imgData = canvas.toDataURL('image/png');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

      // Cleanup
      document.body.removeChild(pageContainer);
    }

    // Save PDF
    pdf.save(
      `${filename}_${new Date().toISOString().split('T')[0]}.pdf`
    );
  } catch (error) {
    console.error('Error exporting to PDF:', error);
  }
}
```

---

## 4. Filter Application (New Approach)

### Before (Old - Triggered Download)
```typescript
const handleExport = () => {
  if (!data) return;
  // ... export logic
  exportToCSV(allInvoices, 'invoice-details'); // ❌ Problem: Downloads on every filter
};

// Button
<button onClick={handleExport}>
  Apply Filters  {/* ❌ Misleading - actually exports */}
</button>
```

### After (New - Just Applies Filters)
```typescript
const handleApplyFilters = () => {
  // Data is automatically updated by the hooks due to dependency changes
  console.log('Filters applied - data is now filtered');
  // ✓ No download triggered
  // ✓ Hooks automatically re-fetch with new filter params
};

// Button
<button onClick={handleApplyFilters}>
  Apply Filters  {/* ✓ Only filters, no download */}
</button>
```

---

## 5. Data Formatting Examples

### Invoice Details Export Format
```typescript
{
  'SR': 1,
  'Invoice Number': 'INV-001',
  'Invoice Date': '31-12-25',
  'Mfg Firm': 'ABC Textiles',
  'Credit Period (Days)': 30,
  'Due Date': '30-01-26',
  'Net Amount': 50000,
  'Payment Type': 'Cash',
  'Status': 'UNPAID',
  'Buyer': 'XYZ Industries',
  'Ageing (Days)': 1
}
```

### Summary Report Export Format (CSV)
```typescript
{
  'Buyer': 'ABC Industries',
  'Total Invoices': 15,
  'Total Amount': 750000,
  'Paid Amount': 500000,
  'Unpaid Amount': 250000,
  'Overdue Amount': 100000,
  'Due Today': 50000,
  'Due Soon': 100000
}
```

### Summary Report Export Format (PDF)
```typescript
{
  Buyer: 'ABC Industries',
  'Total Invoices': 15,
  'Total Amount': '₹7,50,000',    // Formatted currency
  'Paid Amount': '₹5,00,000',
  'Unpaid Amount': '₹2,50,000',
  'Overdue Amount': '₹1,00,000',
  'Due Today': '₹50,000',
  'Due Soon': '₹1,00,000'
}
```

---

## 6. Styling Reference

### Export Button Styling
```typescript
className="flex items-center gap-2 px-4 py-2 bg-green-600 
  hover:bg-green-700 disabled:bg-slate-300 text-white rounded-lg 
  font-medium transition-colors"
```

### Modal Background
```typescript
className="fixed inset-0 bg-black bg-opacity-50 z-50 flex 
  items-center justify-center"
```

### PDF Table Header
```css
background-color: #1f2937;
color: white;
border: 1px solid #333;
padding: 8px;
text-align: left;
font-weight: bold;
font-size: 12px;
```

### PDF Table Data Cell
```css
border: 1px solid #ddd;
padding: 6px;
font-size: 10px;
```

### Alternating Row Colors
```css
row even: background-color: #ffffff;
row odd:  background-color: #f9fafb;
```

---

## 7. Error Handling

### CSV Export Error
```typescript
try {
  exportReportToCSV(data, filename);
} catch (error) {
  console.error('Error exporting to CSV:', error);
  // User sees loading state change but can retry
}
```

### PDF Export Error
```typescript
try {
  await exportReportToPDF(data, headers, filename, title);
} catch (error) {
  console.error('Error exporting to PDF:', error);
  // Modal stays open for retry
} finally {
  setIsExporting(false); // Always clean up
}
```

---

## 8. File Naming Convention

### Pattern
```
{reportType}-report_{date}.{extension}
```

### Examples
```
invoices-report_2025-12-31.csv
invoices-report_2025-12-31.pdf
orders-report_2025-12-31.csv
orders-report_2025-12-31.pdf
invoice-details_2025-12-31.csv
invoice-details_2025-12-31.pdf
```

### Date Format
```typescript
new Date().toISOString().split('T')[0]  // Returns: 2025-12-31
```

---

## 9. Loading State Management

### During Export
```typescript
const [isExporting, setIsExporting] = useState(false);

// Start
setIsExporting(true);
// Modal shows loading spinner
// Buttons are disabled
// User sees: "Generating file..."

// End
setIsExporting(false);
// Loading spinner hides
// Buttons are enabled
// Modal closes (usually)
```

### Modal Passes Loading State
```typescript
<ExportModal
  isLoading={isExporting}  // ← Controls spinner visibility
  onCSVExport={handleCSVExport}
  onPDFExport={handlePDFExport}
/>
```

---

## 10. Testing Code Snippets

### Test CSV Export
```typescript
// In browser console
await handleCSVExport();
// Should see: file download in browser
// Check file has correct data and headers
```

### Test PDF Export
```typescript
// In browser console
await handlePDFExport();
// Should see: PDF file download
// Open PDF and verify:
// - Landscape orientation
// - Full borders
// - Proper page layout
// - Page numbers
```

### Test Filter + Export
```typescript
// 1. Set filter
setInvoiceFilter('overdue');

// 2. Click Apply Filters
handleApplyFilters();

// 3. Click Export
setShowExportModal(true);

// 4. Export as CSV
handleCSVExport();

// 5. Verify CSV contains ONLY overdue invoices
```

---

## Quick Reference - Function Signatures

```typescript
// Export functions
exportToCSV(data: any[], filename: string): void
exportReportToCSV(data: any[], filename: string): void
exportReportToPDF(
  data: any[],
  headers: string[],
  filename: string,
  title?: string
): Promise<void>
exportInvoiceToPDF(
  invoices: InvoiceReportData[],
  filename: string,
  title?: string
): Promise<void>

// Component functions
handleApplyFilters(): void
handleCSVExport(): void
handlePDFExport(): Promise<void>

// Hook functions
useInvoiceReports(
  groupBy: string,
  filter: string,
  buyer: string,
  mfg: string,
  paymentType: string,
  invoiceStatus: string
): { data, loading, error }

useOrderReports(
  groupBy: string,
  status: string,
  buyer: string,
  mfg: string
): { data, loading, error }
```

---

**Code Reference Complete**

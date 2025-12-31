# Reporting Module Implementation Guide

## Overview
A complete, non-destructive reporting module has been added to your TextileHub application. This module provides comprehensive reporting capabilities for invoices and orders without modifying existing core functionality.

## Architecture & File Structure

### Backend (API Routes)

```
src/app/api/textile/reports/
├── invoices/
│   └── route.ts          # Invoice report generation
├── orders/
│   └── route.ts          # Order report generation
└── __tests__/
    └── reports.test.ts   # Testing suite
```

### Frontend (Components & Hooks)

```
src/components/
└── ReportsModule.tsx     # Main Reports UI component

src/lib/hooks/
└── useReports.ts         # Custom hooks and utilities
```

### Dashboard Integration

```
src/app/textile-dashboard/
└── page.tsx              # Updated with Reports tab
```

---

## Implementation Details

### 1. API Endpoints

#### Invoice Reports Endpoint
**Route:** `GET /api/textile/reports/invoices`

**Query Parameters:**
- `groupBy`: `buyer` | `mfg` | `all` (default: `all`)
- `filter`: `overdue` | `dueToday` | `dueSoon` | `all` (default: `all`)

**Response Structure:**
```typescript
{
  success: boolean;
  data: {
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
  };
  metadata: {
    generatedAt: string; // ISO timestamp
    filters: { groupBy: string; filter: string };
    recordCount: number;
  };
}
```

**Example Usage:**
```bash
# All invoices grouped by buyer
GET /api/textile/reports/invoices?groupBy=buyer&filter=all

# Only overdue invoices grouped by manufacturer
GET /api/textile/reports/invoices?groupBy=mfg&filter=overdue

# Invoices due soon by buyer
GET /api/textile/reports/invoices?groupBy=buyer&filter=dueSoon
```

#### Order Reports Endpoint
**Route:** `GET /api/textile/reports/orders`

**Query Parameters:**
- `groupBy`: `buyer` | `mfg` | `all` (default: `all`)
- `status`: `pending` | `completed` | `all` (default: `all`)

**Response Structure:**
```typescript
{
  success: boolean;
  data: {
    buyerWise: Record<string, OrderReport>;
    mfgWise: Record<string, OrderReport>;
    summary: {
      totalBuyers: number;
      totalMfgs: number;
      totalOrders: number;
      totalQuantity: number;
    };
  };
  metadata: {
    generatedAt: string;
    filters: { groupBy: string; status: string };
    recordCount: number;
  };
}
```

### 2. Filter Logic Specifications

#### Invoice Aging Filters

##### Overdue Invoices
```typescript
condition: invoice.ageing > 0 AND invoice.status === 'UNPAID'
```
- Includes invoices past their due date that haven't been paid
- Ageing value > 0 indicates number of days overdue

##### Due Today
```typescript
condition: dueDate === today AND invoice.status === 'UNPAID'
```
- Exact date match with today's date
- Date format: DD-MM-YYYY, parsed and compared at midnight

##### Due Soon (1-3 Days)
```typescript
condition: 1 <= daysUntilDue <= 3 AND invoice.status === 'UNPAID'
```
- Invoices with due dates within next 1-3 days
- Uses ceiling calculation for day boundaries

#### Date Calculation
```typescript
const today = new Date();
today.setHours(0, 0, 0, 0); // Reset to midnight

const daysUntilDue = Math.ceil(
  (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
);
```

### 3. Data Aggregation Logic

#### Buyer-wise Aggregation
For each buyer, the system aggregates:
- Total number of invoices/orders
- Total amount (invoices) or quantity (orders)
- Total paid/unpaid amounts (invoices only)
- Overdue amounts (invoices only)
- Counts for due today and due soon (invoices only)

#### Manufacturer-wise Aggregation
Same aggregation applied for each manufacturer.

### 4. React Hooks

#### useInvoiceReports Hook
```typescript
const { data, loading, error } = useInvoiceReports(groupBy, filter);
```
- Fetches invoice reports automatically when parameters change
- Returns data, loading state, and error messages
- Built-in error handling

#### useOrderReports Hook
```typescript
const { data, loading, error } = useOrderReports(groupBy, status);
```
- Fetches order reports automatically when parameters change
- Similar interface to invoice reports hook

### 5. UI Components

#### ReportsModule Component
- Main Reports interface with tab switching
- Filter controls for grouping and status
- Summary statistics cards
- Expandable detailed reports
- CSV export functionality

**Features:**
- Type-safe implementation
- Responsive design (mobile & desktop)
- Error boundary with user-friendly messages
- Loading states with skeleton UI
- Empty state handling

---

## Filter Calculations - Detailed Examples

### Example 1: Overdue Invoice Detection

**Invoice Data:**
```typescript
{
  invoice: 'INV001',
  due: '10-12-2024',        // December 10, 2024
  ageing: 46,               // 46 days past due date
  status: 'UNPAID'
}
```

**Calculation:**
```typescript
isOverdue = (ageing > 0) && (status === 'UNPAID')
isOverdue = (46 > 0) && ('UNPAID' === 'UNPAID')
isOverdue = true ✓
```

### Example 2: Due Soon Calculation

**Current Date:** January 25, 2025

**Invoice Data:**
```typescript
{
  invoice: 'INV003',
  due: '26-01-2025',        // January 26, 2025 (tomorrow)
  ageing: -1,
  status: 'UNPAID'
}
```

**Calculation:**
```typescript
today = January 25, 2025 (midnight)
dueDate = January 26, 2025 (midnight)
daysUntilDue = ceil((Jan 26 - Jan 25) / 1 day) = 1 day

isDueSoon = (1 <= daysUntilDue <= 3) && (status === 'UNPAID')
isDueSoon = (1 <= 1 <= 3) && ('UNPAID' === 'UNPAID')
isDueSoon = true ✓
```

### Example 3: Invoice Not Yet Due

**Invoice Data:**
```typescript
{
  invoice: 'INV006',
  due: '20-02-2025',        // February 20, 2025
  ageing: -27,              // Due in 27 days
  status: 'UNPAID'
}
```

**Calculation:**
```typescript
daysUntilDue = 27 days

isDueSoon = (1 <= 27 <= 3) && (status === 'UNPAID')
isDueSoon = false  // Outside 1-3 day window
```

---

## Error Handling

### API Error Responses

All API endpoints implement robust error handling:

```typescript
try {
  // Processing logic
} catch (error) {
  return NextResponse.json(
    {
      success: false,
      error: 'Failed to generate reports',
      details: error instanceof Error ? error.message : 'Unknown error'
    },
    { status: 500 }
  );
}
```

### Frontend Error Handling

React hooks include:
- Try-catch blocks for API calls
- Error state management
- User-friendly error messages
- Console logging for debugging

```typescript
try {
  setLoading(true);
  setError(null);
  const response = await fetch(`/api/textile/reports/invoices?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Unknown error');
  }
  
  setData(result.data);
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Failed to fetch';
  setError(errorMessage);
  console.error('Error:', errorMessage);
}
```

---

## Testing

### Running Tests

Execute the test file in Node.js:
```bash
node src/app/api/textile/reports/__tests__/reports.test.ts
```

### Test Suites Included

1. **Date Parsing Tests** - Validates date parsing logic
2. **Overdue Detection Tests** - Verifies overdue invoice identification
3. **Due Today Tests** - Confirms same-day due date matching
4. **Due Soon Tests** - Validates 1-3 day window calculation
5. **Invoice Aggregation Tests** - Tests grouping and summation
6. **Currency Formatting Tests** - Ensures INR formatting
7. **Edge Cases** - Boundary conditions and special cases

**Sample Output:**
```
=== Test Suite 1: Date Parsing ===
✓ Valid date: PASS
✓ Start of year: PASS
✓ End of year: PASS

=== Test Suite 2: Overdue Invoice Detection ===
✓ Invoice 46 days overdue: PASS (ageing: 46)
✓ Invoice 41 days overdue: PASS (ageing: 41)
✓ Not yet due: PASS (ageing: -3)
✓ Paid invoice: PASS (ageing: 0)
...
```

---

## Integration with Existing System

### Non-Destructive Design

The module is fully isolated and does not modify:
- Existing Invoice or Order models
- Current authentication system
- Existing Dashboard functionality
- Database schema or queries

### Dashboard Integration

Added Reports tab to navigation without changing existing tabs:
```typescript
{[
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'pending', label: 'Pending Orders', icon: Clock },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'buyerAgeing', label: 'Buyer Ageing', icon: Users },
  { id: 'mfgAgeing', label: 'Mfg Ageing', icon: Factory },
  { id: 'reports', label: 'Reports', icon: BarChart3 }  // ← New
]}
```

---

## Usage Examples

### Example 1: Display All Invoices by Buyer
```typescript
import { useInvoiceReports } from '@/lib/hooks/useReports';

function MyComponent() {
  const { data, loading, error } = useInvoiceReports('buyer', 'all');
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  
  return (
    <div>
      {Object.entries(data.buyerWise).map(([buyer, report]) => (
        <div key={buyer}>
          <h3>{buyer}</h3>
          <p>Total: {formatCurrency(report.totalAmount)}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Export Overdue Invoices
```typescript
import { useInvoiceReports, exportToCSV } from '@/lib/hooks/useReports';

function ExportButton() {
  const { data } = useInvoiceReports('all', 'overdue');
  
  const handleExport = () => {
    const exportData = Object.values(data.buyerWise).map(report => ({
      Buyer: report.buyer,
      OverdueAmount: report.overdueAmount,
      Count: report.totalInvoices
    }));
    
    exportToCSV(exportData, 'overdue-invoices');
  };
  
  return <button onClick={handleExport}>Export Overdue</button>;
}
```

---

## Performance Considerations

### Current Implementation (Mock Data)
- All calculations performed in-memory
- No database queries needed
- Response time: < 100ms

### Production Implementation
When connecting to Firebase:
1. Create indexes on `ageing_buyer` and `ageing_mfg` collections
2. Consider caching frequently accessed reports
3. Implement pagination for large datasets
4. Use batch queries for better performance

---

## Future Enhancements

### Suggested Improvements
1. **Real-time Data**: Connect to Firebase for live data
2. **Advanced Filters**: Add date range selection
3. **Charts & Visualizations**: Integrate Chart.js or similar
4. **Scheduled Reports**: Email reports to stakeholders
5. **Custom Date Ranges**: Allow flexibility in date selection
6. **Trend Analysis**: Show month-over-month comparisons
7. **Export Formats**: Add PDF, Excel export options

---

## Troubleshooting

### Common Issues

**Issue:** Reports not showing data
- Check browser console for error messages
- Verify API endpoints are accessible
- Ensure Firebase data is properly structured

**Issue:** Incorrect date calculations
- Verify date format is DD-MM-YYYY
- Check timezone handling
- Ensure today's date is set to midnight

**Issue:** Filters not working
- Verify filter parameter names (overdue/dueToday/dueSoon)
- Check invoice status values (PAID/UNPAID/RETURN)
- Confirm ageing values are correct

---

## API Integration Checklist

- [x] Invoice Reports endpoint created
- [x] Order Reports endpoint created
- [x] Filter logic implemented
- [x] Error handling added
- [x] React hooks created
- [x] UI components built
- [x] Dashboard integration complete
- [x] Test suite created
- [x] Documentation provided

---

## Support

For issues or questions:
1. Check the test suite for reference implementations
2. Review filter logic examples above
3. Examine error messages in browser console
4. Verify data structure matches expected format

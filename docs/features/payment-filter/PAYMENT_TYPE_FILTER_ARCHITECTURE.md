# Payment Type Filter - Technical Architecture

## Component Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        ReportsModule.tsx                         │
│                      (Main Component)                            │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   ┌─────────────┐         ┌────────────────────┐
   │State Init   │         │Hook Integration    │
   ├─────────────┤         ├────────────────────┤
   │paymentType  │────────▶│useInvoiceReports() │
   │Filter:      │         │with paymentType    │
   │'all'        │         │parameter           │
   └─────────────┘         └────────┬───────────┘
        │                            │
        │                            ▼
        │                    ┌──────────────────────┐
        │                    │useReports.ts Hook    │
        │                    ├──────────────────────┤
        │                    │Filter Logic:         │
        │                    │- if (paymentType ==  │
        │                    │     'cash')          │
        │                    │- if (paymentType ==  │
        │                    │     'gst')           │
        │                    │- else: no filter     │
        │                    └────────┬─────────────┘
        │                             │
        │                             ▼
        │                    ┌──────────────────┐
        │                    │Firebase Query     │
        │                    │with filtered      │
        │                    │invoice data       │
        │                    └────────┬──────────┘
        │                             │
        ▼                             ▼
   ┌──────────────────────────────────────────────────┐
   │     JSX Render Section - Filter UI Buttons       │
   │         (Lines 293-327)                          │
   ├──────────────────────────────────────────────────┤
   │ Section 3: PAYMENT TYPE FILTERS                 │
   │                                                  │
   │  [   All   ] [  💰 Cash Invoice  ] [ 📄 GST ]   │
   │                                                  │
   │  onClick handlers:                              │
   │  ├─ All     → setPaymentTypeFilter('all')       │
   │  ├─ Cash    → setPaymentTypeFilter('cash')      │
   │  └─ GST     → setPaymentTypeFilter('gst')       │
   └──────────────┬───────────────────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │ State Updated       │
        │ React Re-renders    │
        │ Results Display     │
        └─────────────────────┘
```

## Data Filter Pipeline

```
Firebase Collection (Invoices)
         │
         │  All documents with payment_type field
         │
         ▼
    ┌─────────────────────────────────────┐
    │  Filter By Payment Type             │
    │  ┌─────────────────────────────────┐│
    │  │ paymentTypeFilter === 'all'     ││ → Pass all through
    │  │ paymentTypeFilter === 'cash'    ││ → Filter: payment_type = 'Cash'
    │  │ paymentTypeFilter === 'gst'     ││ → Filter: payment_type = 'GST'
    │  └─────────────────────────────────┘│
    └─────────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │  Combined with Other Filters        │
    │  ├─ Due Date Filter                 │
    │  ├─ Status Filter                   │
    │  ├─ Buyer Filter                    │
    │  └─ Mfg Filter                      │
    └─────────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │  Generate Reports (grouped by       │
    │  buyer/mfg and summarized)          │
    └─────────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │  Display Results in UI              │
    │  ├─ Summary Stats                   │
    │  ├─ Buyer-wise Report              │
    │  ├─ Mfg-wise Report                │
    │  └─ Invoice Details (optional)      │
    └─────────────────────────────────────┘
```

## Button State Management

```
┌──────────────────────────────────────────────────────────┐
│             Payment Type Filter Buttons                   │
│                                                          │
│  paymentTypeFilter State: 'all' | 'cash' | 'gst'       │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Button: "All"                                       ││
│  │ State: paymentTypeFilter === 'all'                  ││
│  │ Style: bg-purple-600 text-white (if active)         ││
│  │        bg-white hover:bg-purple-100 (if inactive)   ││
│  │ onClick: setPaymentTypeFilter('all')                ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Button: "💰 Cash Invoice"                           ││
│  │ State: paymentTypeFilter === 'cash'                 ││
│  │ Filters: payment_type === 'Cash'                    ││
│  │ onClick: setPaymentTypeFilter('cash')               ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Button: "📄 GST Invoice"                            ││
│  │ State: paymentTypeFilter === 'gst'                  ││
│  │ Filters: payment_type === 'GST'                     ││
│  │ onClick: setPaymentTypeFilter('gst')                ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Integration Points

```
src/components/ReportsModule.tsx
│
├─ State Variables (Line 38)
│  └─ paymentTypeFilter: PaymentTypeFilterType = 'all'
│
├─ JSX Render Section (Lines 293-327)
│  └─ Payment Type Filter Buttons
│     ├─ All Button
│     ├─ Cash Invoice Button
│     └─ GST Invoice Button
│
├─ Hook Integration (Line 43)
│  └─ useInvoiceReports(..., paymentTypeFilter, ...)
│
└─ Clear Filters Button (Line 378)
   └─ setPaymentTypeFilter('all')

              │
              ▼

src/lib/hooks/useReports.ts
│
├─ Hook Parameters (Line 74)
│  └─ paymentType: string = 'all'
│
├─ Filter Logic (Lines 116-120)
│  ├─ if (paymentType === 'cash')
│  │  └─ filter: payment_type === 'Cash'
│  └─ else if (paymentType === 'gst')
│     └─ filter: payment_type === 'GST'
│
└─ Dependencies (Line 168)
   └─ [groupBy, filter, buyer, mfg, paymentType, invoiceStatus]
```

## Type Definitions

```typescript
// Type alias for Payment Type Filter
type PaymentTypeFilterType = 'all' | 'cash' | 'gst';

// Firebase Invoice Data Structure
interface InvoiceReportData {
  id: string;
  invoice: string;
  date: string;
  buyer: string;
  mfg: string;
  amount: number;
  due: string;
  status: 'PAID' | 'UNPAID' | 'RETURN';
  ageing: number;
  payment_type?: 'GST' | 'Cash';  // ← This field
}
```

## Filter Combination Examples

### Example 1: GST + Unpaid + Overdue
```
User Selections:
├─ Payment Type: "GST"
├─ Status: "UNPAID"
└─ Due Date: "Overdue"

Filtering Process:
1. Get all invoices
2. Filter payment_type = 'GST'
3. Filter status = 'UNPAID'
4. Filter ageing > 0
5. Display combined results
```

### Example 2: Cash + Specific Buyer
```
User Selections:
├─ Payment Type: "Cash"
└─ Buyer: "GARG TEXTILE"

Filtering Process:
1. Get all invoices
2. Filter payment_type = 'Cash'
3. Filter buyer = 'GARG TEXTILE'
4. Display combined results
```

## CSS Classes Used

```
Container:
- bg-purple-50 p-3 rounded-lg    (Light purple background)

Active Button State:
- px-4 py-2 rounded-lg text-sm font-medium
- bg-purple-600 text-white       (Filled purple)

Inactive Button State:
- px-4 py-2 rounded-lg text-sm font-medium
- bg-white text-slate-700
- border-2 border-purple-400
- hover:bg-purple-100            (Outlined with hover effect)

Label:
- text-xs font-bold text-purple-700 block mb-3 uppercase
```

## Event Flow Sequence

```
1. User clicks Payment Type button (e.g., "Cash Invoice")
   │
   ▼
2. onClick handler fires: setPaymentTypeFilter('cash')
   │
   ▼
3. React state updates: paymentTypeFilter = 'cash'
   │
   ▼
4. Component re-renders with new state value
   │
   ▼
5. useInvoiceReports hook dependency array detects paymentType change
   │
   ▼
6. useEffect in hook runs with new paymentType = 'cash'
   │
   ▼
7. Firebase query executes with filter logic:
   if (paymentType === 'cash') {
     filtered = filtered.filter((inv) => inv.payment_type === 'Cash')
   }
   │
   ▼
8. Filtered data returned and state updated
   │
   ▼
9. Component receives new data props
   │
   ▼
10. UI re-renders showing only Cash invoices
    │
    ▼
11. Button visual state updates to show 'cash' is selected
    (Purple background for Cash button)
```

## Summary

✅ **Fully Implemented** - The Payment Type filter is complete, functional, and properly integrated
✅ **Proper JSX Rendering** - Buttons are explicitly rendered in the DOM (Lines 293-327)
✅ **State Management** - Dedicated state variable with proper type safety
✅ **Filter Logic** - Applied in the useReports hook with correct Firebase field mapping
✅ **UI/UX** - Consistent design with existing filters, visual feedback on selection
✅ **Combined Filtering** - Works seamlessly with all other filters

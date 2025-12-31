# Quick Test Guide - Export Feature

## How to Test the New Export Feature

### Setup
1. Navigate to the Reports & Analytics page
2. Select "Invoice Reports" or "Order Reports"

---

## Test 1: Filter Application (No Download)
**Expected:** Clicking "Apply Filters" updates data, NOT triggers download

```
1. Set any filter (e.g., Due Date = "Overdue")
2. Click "Apply Filters" button (blue, lower-left)
3. ✓ Should see filtered data appear on screen
4. ✓ Should NOT see a file download
5. ✓ Filters should be reflected in the summary cards
```

---

## Test 2: Export Modal Opens
**Expected:** Clicking Export button opens modal with two options

```
1. Click "Export / Download" button (green, top-right of table)
2. ✓ Modal should appear with semi-transparent backdrop
3. ✓ Modal shows two options:
   - Download as CSV (blue)
   - Download as PDF (red)
4. ✓ "Cancel" button should close modal
5. ✓ X button (top-right of modal) should close modal
```

---

## Test 3: CSV Export
**Expected:** CSV file downloads with filtered data

```
1. Open Export Modal
2. Click "Download as CSV"
3. ✓ File should download: invoice-details_2025-12-31.csv (or similar)
4. ✓ Open in Excel/Google Sheets
5. ✓ Data should match filtered results on screen
6. ✓ All columns should be present
7. ✓ No data should be cut off
```

---

## Test 4: PDF Export - Single Page
**Expected:** Professional, landscape PDF with borders

```
1. Apply filter to show ~10-15 invoices
2. Click "Export / Download" button
3. Click "Download as PDF"
4. ✓ File should download: invoices-report_2025-12-31.pdf (or similar)
5. Open PDF
6. ✓ Layout should be LANDSCAPE (wider than tall)
7. ✓ Title at top: "Invoice Report" or similar
8. ✓ Date generated shown (top-right)
9. ✓ Table should have:
   - Dark header row with white text
   - Full grid borders (all cells have borders)
   - Clean spacing and padding
10. ✓ Data should match on-screen display
11. ✓ Page should show "Page 1 of 1"
```

---

## Test 5: PDF Export - Multiple Pages
**Expected:** Professional page breaks without cutting rows

```
1. Apply filter to show ~50+ invoices
2. Click "Export / Download" button
3. Click "Download as PDF"
4. Open PDF
5. ✓ Should have 2+ pages
6. ✓ Each page should show:
   - "Page X of Y" at bottom
   - Proper table formatting
7. ✓ No table rows should be cut in half across pages
8. ✓ Header row styling consistent on all pages
9. ✓ Borders and gridlines clear on all pages
```

---

## Test 6: Different Report Types
**Expected:** Export works for both invoice and order reports

```
Invoice Reports - Details View:
1. Click "Invoice Details" button
2. Click Export button
3. ✓ CSV includes all invoice columns (Invoice #, Date, Mfg, Amount, etc.)
4. ✓ PDF shows invoice table with full formatting

Invoice Reports - Summary View:
1. Click "Summary Report" button
2. Click Export button
3. ✓ CSV shows buyer-wise summary data
4. ✓ PDF shows summary data properly formatted

Order Reports:
1. Click "Order Reports" tab
2. Set any filters
3. Click Export button
4. ✓ CSV/PDF export order data correctly
```

---

## Test 7: Filter + Export Combination
**Expected:** Export respects current filters

```
1. Set multiple filters:
   - Due Date: "Overdue"
   - Status: "UNPAID"
   - Payment Type: "Cash"
2. Click "Apply Filters"
3. Note the data shown on screen
4. Click "Export / Download"
5. Download as CSV
6. ✓ CSV should ONLY contain filtered rows
7. ✓ Should match visible data on screen
8. Repeat with PDF
9. ✓ PDF should also show ONLY filtered data
```

---

## Test 8: Loading State
**Expected:** Modal shows loading during export

```
1. Click "Export / Download" button
2. Click "Download as CSV" or "Download as PDF"
3. ✓ Modal should show loading spinner
4. ✓ Modal should display "Generating file..."
5. ✓ Buttons should be disabled during export
6. ✓ Export should complete within 5 seconds
7. ✓ Modal should close after export completes
```

---

## Test 9: Empty Data Handling
**Expected:** Export button handles empty results gracefully

```
1. Apply filter that returns no data
2. ✓ Export button should be disabled (grayed out)
3. Click "Apply Filters"
4. ✓ Summary cards should show 0 values
5. Message should show "No data available for selected filters"
```

---

## Test 10: Responsive Design (Mobile)
**Expected:** Modal works on mobile devices

```
On mobile browser or responsive view:
1. Click "Export / Download"
2. ✓ Modal should be centered and readable
3. ✓ No text overflow
4. ✓ Buttons should be clickable (not too small)
5. ✓ Close button should work
```

---

## Common Issues to Check

| Issue | Check |
|-------|-------|
| Modal doesn't open | Verify ExportModal component is imported |
| Download doesn't trigger | Check browser console for errors |
| PDF looks wrong | Verify jsPDF and html2canvas packages |
| Filters don't update data | Check hook dependency array |
| Modal buttons disabled | Ensure data is not null/undefined |
| CSV encoding issues | Check if special characters are quoted |

---

## Browser DevTools Debugging

Open DevTools (F12) and check Console for messages:

```javascript
// Success messages:
// "Exporting data to CSV..."
// "PDF generated successfully"

// Error messages will show with details:
// "Error exporting to CSV: ..."
// "Error exporting to PDF: ..."
```

---

## Visual Checklist

### Export Button
- [ ] Green background (#10b981)
- [ ] Located top-right of "Detailed Report" section
- [ ] Shows Download icon
- [ ] Text reads "Export / Download"
- [ ] Disabled when no data available
- [ ] Hoverable (darker green on hover)

### Export Modal
- [ ] Dark semi-transparent backdrop
- [ ] White card centered on screen
- [ ] Modal title: "Export Report"
- [ ] Two export options with icons
- [ ] CSV option blue, PDF option red
- [ ] Descriptive text under each option
- [ ] Cancel button at bottom
- [ ] X close button at top-right
- [ ] Loading spinner when exporting

### PDF Output
- [ ] Landscape orientation
- [ ] Dark header row (#1f2937)
- [ ] Full borders on all cells
- [ ] Clean, readable font
- [ ] Proper spacing and padding
- [ ] Page numbers at bottom
- [ ] Title and date on first page
- [ ] Professional appearance
- [ ] Printer-friendly colors

---

## Performance Expectations

| Operation | Expected Time |
|-----------|----------------|
| CSV export (100 rows) | <1 second |
| PDF export (single page) | 2-3 seconds |
| PDF export (10+ pages) | 5-10 seconds |
| Modal open/close | <100ms |

---

## Success Criteria ✓

All of the following should be true:

1. ✓ "Apply Filters" button does NOT download
2. ✓ "Export / Download" button is visible and functional
3. ✓ Modal opens when Export button clicked
4. ✓ CSV export works and includes all filtered data
5. ✓ PDF export works with landscape orientation
6. ✓ PDF has full borders on all cells
7. ✓ PDF shows proper page breaks (no split rows)
8. ✓ Both formats can be imported/opened in standard applications
9. ✓ Filenames include dates
10. ✓ No console errors or warnings

---

## Notes

- Downloaded files are saved to user's default Downloads folder
- File names include ISO date (YYYY-MM-DD) for easy organization
- Both CSV and PDF respect the currently applied filters
- Modal can be cancelled at any time
- Loading state prevents multiple simultaneous exports
- Works offline after modal opens (no network calls needed)

Good luck testing! 🚀

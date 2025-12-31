# Reports Module - Quick Start Guide

## What's New?

A complete **Reporting Module** has been added to your TextileHub application. Access it from the sidebar under "Reports".

## Key Features

### 📊 Report Types
1. **Invoice Reports** - Analyze invoices by buyer or manufacturer
2. **Order Reports** - Track orders by buyer or manufacturer

### 🔍 Invoice Filters
- **Overdue** - Invoices past due date that are unpaid
- **Due Today** - Invoices due exactly today
- **Due Soon** - Invoices due within 1-3 days
- **All** - Show all invoices

### 📈 Order Filters
- **Pending** - Orders not yet completed
- **Completed** - Finished orders
- **All** - Show all orders

### 📁 Grouping Options
- **By Buyer** - View data grouped by customer
- **By Manufacturer** - View data grouped by supplier
- **All** - See combined view of both

### 📥 Export
- Download any report as CSV file
- Filename automatically includes date

---

## How to Use

### Step 1: Navigate to Reports
Click "Reports" in the sidebar navigation

### Step 2: Select Report Type
Choose between:
- **Invoice Reports** - For payment tracking
- **Order Reports** - For order management

### Step 3: Apply Filters
1. Select grouping method (Buyer/Mfg/All)
2. Apply status/aging filter (Invoice-specific)
3. System automatically refreshes

### Step 4: Review Summary
Top cards show key metrics:
- **Invoice Reports**: Total amount, overdue, due soon
- **Order Reports**: Total orders, quantities, buyers, suppliers

### Step 5: Expand Details
Click any row to see:
- Detailed breakdown by status
- Item-by-item view
- Paid vs unpaid amounts

### Step 6: Export Data
Click "Export CSV" to download full report

---

## Understanding the Calculations

### Overdue Invoices
An invoice is marked as **overdue** when:
- Due date has passed
- Invoice status is "UNPAID"
- Number of days past due is shown

**Example:**
- Invoice due: Dec 10, 2024
- Today: Jan 25, 2025
- Status: **46 days overdue**

### Due Today
Shows invoices where:
- Due date equals today's date
- Status is "UNPAID"

**Example:**
- Due date: Jan 25, 2025
- Today: Jan 25, 2025
- Status: **Due Today** ✓

### Due Soon
Shows invoices due within next 1-3 days:
- Tomorrow through day after tomorrow: **Include**
- 4+ days away: **Exclude**

**Example:**
- Tomorrow (Jan 26): Included in "Due Soon"
- Day after (Jan 27): Included in "Due Soon"
- 3 days out (Jan 28): Included in "Due Soon"
- 4 days out (Jan 29): NOT included

---

## Data Shown

### By Buyer
For each buyer, you'll see:
- **Total Invoices/Orders** - Count of items
- **Total Amount** - Sum of all amounts
- **Paid Amount** - Sum of paid invoices
- **Unpaid Amount** - Sum of unpaid invoices
- **Overdue Amount** - Sum of past-due invoices
- **Due Today** - Sum due today
- **Due Soon** - Sum due in 1-3 days

### By Manufacturer
Same information but grouped by supplier instead of customer

---

## Tips & Best Practices

### 📌 Regular Monitoring
- Check "Overdue" weekly to track payment delays
- Monitor "Due Soon" to prevent late payments
- Review by manufacturer to track supplier performance

### 📌 Export for Stakeholders
- Export monthly reports for accounting
- Share "Overdue" reports with management
- Create dashboards using exported data

### 📌 Filter Strategy
- Use "By Buyer" to track customer payments
- Use "By Manufacturer" to manage supplier orders
- Use "All" for company-wide overview

### 📌 Action Items
When reviewing reports:
1. **Overdue invoices** → Follow up with customers
2. **Due soon items** → Prepare payment scheduling
3. **High totals** → Monitor carefully

---

## Common Questions

### Q: Why is an invoice marked as overdue?
**A:** An invoice is overdue when the due date has passed AND it's marked as UNPAID. Once paid, it stops appearing in overdue reports.

### Q: Can I filter by custom date ranges?
**A:** Currently, filters are: Overdue, Due Today, Due Soon. Use the current date-based filters for standard business needs.

### Q: How often does the data update?
**A:** Reports pull live data from your database. Refresh the browser to get latest data.

### Q: Can I print the reports?
**A:** Yes! Use your browser's print function (Ctrl+P or Cmd+P). For long-term storage, use the "Export CSV" feature.

### Q: What does the summary section show?
**A:** Top-level metrics across all filtered data:
- Total invoices/orders
- Total amounts
- Counts by status
- Key financial metrics

---

## Troubleshooting

### Reports Not Loading?
1. Check internet connection
2. Refresh the page (F5 or Cmd+R)
3. Clear browser cache
4. Try a different filter option

### Dates Look Wrong?
- Ensure your browser timezone is correct
- Date format is: DD-MM-YYYY
- Due date and today's date are compared at midnight

### Export Not Working?
1. Check pop-up blocker settings
2. Verify "Export CSV" button is enabled
3. Try a different browser
4. Contact support if issue persists

### Numbers Don't Match?
- Multiple invoices may exist per buyer/mfg
- Filter may be limiting data shown
- Check if paid invoices are included
- Verify invoice status values

---

## Feature Reference

### Invoice Report Columns
| Column | Description |
|--------|-------------|
| Buyer/Mfg | Customer or Supplier name |
| Total Invoices | Count of invoices |
| Total Amount | Sum of all invoice amounts |
| Paid Amount | Sum of paid invoices |
| Unpaid Amount | Sum of unpaid invoices |
| Overdue Amount | Sum of past-due unpaid invoices |
| Due Today | Sum of invoices due today |
| Due Soon | Sum of invoices due in 1-3 days |

### Order Report Columns
| Column | Description |
|--------|-------------|
| Buyer/Mfg | Customer or Supplier name |
| Total Orders | Count of orders |
| Total Quantity | Sum of quantities across orders |
| Unit | Unit of measurement (kg, meters, etc.) |

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Export Report | Click Export CSV button |
| Expand Row | Click row to expand details |
| Change Filter | Use filter dropdowns |
| Refresh Data | F5 or Cmd+R |
| Print Report | Ctrl+P or Cmd+P |

---

## Data Privacy

- All reports are generated from your database
- No data is sent to external services
- Reports stay within your application
- CSV exports contain your sensitive data - store securely

---

## Need Help?

1. **Review Examples** - Check expanded rows for data breakdown
2. **Check Calculations** - Read REPORTING_MODULE_GUIDE.md for detailed logic
3. **Run Tests** - Execute test suite to verify functionality
4. **Check Logs** - Browser console shows any error messages

---

## Next Steps

1. ✅ Explore Invoice Reports by clicking "Reports" in sidebar
2. ✅ Try different filter combinations
3. ✅ Export a sample report as CSV
4. ✅ Review overdue invoices and plan follow-ups
5. ✅ Set up regular reporting schedule

---

**Version:** 1.0  
**Last Updated:** December 25, 2025  
**Status:** ✅ Production Ready

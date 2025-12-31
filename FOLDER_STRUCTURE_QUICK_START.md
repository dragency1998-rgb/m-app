# 🚀 NEW FOLDER STRUCTURE - QUICK START GUIDE

## Where to Find Things

### 📦 Components

**Need a common component** (Navbar, Footer, etc.)?
```
src/components/common/
├── Navbar.tsx
├── Footer.tsx
├── Alert.tsx
├── LoadingSpinner.tsx
└── ProtectedRoute.tsx
```

**Need report-specific components?**
```
src/components/reports/
├── ReportsModule.tsx      # Main reports UI
└── ExportModal.tsx        # Export functionality
```

**Need UI primitives** (Card, Badge)?
```
src/components/ui/
└── Card.tsx               # Re-exports Card + Badge
```

### 🪝 Hooks

All custom React hooks are in:
```
src/lib/hooks/
├── useAuth.ts             # Authentication logic
├── useFirestore.ts        # Firestore operations
├── useReports.ts          # Reports + export logic
└── useTextileDashboard.ts # Dashboard logic
```

### 🔧 Utilities & Services

**API calls?** Use services:
```
src/lib/services/
└── api.ts                 # HTTP utilities (get, post, put, del)
```

**Formatting?** Use utils:
```
src/lib/utils/
├── formatters.ts          # Date, currency, text formatting
├── validators.ts          # Email, password, URL validation
└── cn.ts                  # Tailwind class merging
```

## 🔍 How to Import

### Common Components
```typescript
import Navbar from '@/components/common/Navbar'
import Footer from '@/components/common/Footer'
import Alert from '@/components/common/Alert'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ProtectedRoute from '@/components/common/ProtectedRoute'
```

### UI Components
```typescript
import { Card, Badge } from '@/components/ui/Card'
```

### Reports Feature
```typescript
import ReportsModule from '@/components/reports/ReportsModule'
import ExportModal from '@/components/reports/ExportModal'
```

### Hooks
```typescript
import { useAuth } from '@/lib/hooks/useAuth'
import { useFirestore } from '@/lib/hooks/useFirestore'
import { useReports } from '@/lib/hooks/useReports'
import { useTextileDashboard } from '@/lib/hooks/useTextileDashboard'
```

### Utilities & Services
```typescript
// API calls
import { apiCall, get, post, put, del } from '@/lib/services/api'

// Formatting
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils/formatters'

// Validation
import { isEmail, isStrongPassword, isPhoneNumber } from '@/lib/utils/validators'

// Class merging
import { cn } from '@/lib/utils/cn'
```

## ✅ Common Tasks

### Add a New Common Component

1. Create file in `src/components/common/`
2. Name it like: `MyComponent.tsx`
3. Import where needed: `import MyComponent from '@/components/common/MyComponent'`

Example:
```bash
# Create file
touch src/components/common/Header.tsx

# Import
import Header from '@/components/common/Header'
```

### Add a New Report Feature

1. Create component in `src/components/reports/`
2. Add related hooks in `src/lib/hooks/` if needed
3. Import: `import MyReportComponent from '@/components/reports/MyReportComponent'`

Example:
```bash
# Create file
touch src/components/reports/AnalyticsChart.tsx

# Import
import AnalyticsChart from '@/components/reports/AnalyticsChart'
```

### Add a New Utility Function

1. Add to appropriate file in `src/lib/utils/`
   - Formatting → `formatters.ts`
   - Validation → `validators.ts`
   - Class merging → `cn.ts`
2. Export from the file
3. Import where needed

Example:
```typescript
// In src/lib/utils/formatters.ts
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString()
}

// Import where needed
import { formatTime } from '@/lib/utils/formatters'
```

### Add a New Service

1. Create file in `src/lib/services/`
2. Add service functions
3. Import where needed

Example:
```typescript
// src/lib/services/reportService.ts
export const fetchReports = async () => {
  return get('/api/reports')
}

// Import
import { fetchReports } from '@/lib/services/reportService'
```

## 📂 When to Use Each Folder

| Folder | Use When |
|--------|----------|
| `src/components/common/` | Component is used across multiple features (Navbar, Footer, etc.) |
| `src/components/{feature}/` | Component is specific to a feature (Reports, Dashboard) |
| `src/components/ui/` | Component is a generic UI primitive (Card, Button, etc.) |
| `src/lib/hooks/` | Logic that needs to be reused (state management, data fetching) |
| `src/lib/services/` | API calls or external integrations |
| `src/lib/utils/` | Pure functions (formatting, validation, helpers) |
| `src/lib/providers/` | Context providers and state management |
| `src/types/` | Shared TypeScript type definitions (for future use) |

## 🔄 Migration from Old Structure

If you're updating from the old structure:

**Old Path** → **New Path**
```
src/components/Navbar.tsx          → src/components/common/Navbar.tsx
src/components/Footer.tsx          → src/components/common/Footer.tsx
src/components/Alert.tsx           → src/components/common/Alert.tsx
src/utils/api.ts                   → src/lib/services/api.ts
src/utils/formatters.ts            → src/lib/utils/formatters.ts
src/utils/validators.ts            → src/lib/utils/validators.ts
src/utils/cn.ts                    → src/lib/utils/cn.ts
```

Just update your import statements to the new paths. ✅

## 🧪 Testing Your Changes

After moving files or updating imports:

```bash
# Type check
npm run type-check

# Build
npm run build

# Development
npm run dev
```

If you see any errors, check that:
1. File paths use `@/` alias (e.g., `@/components/common/Navbar`)
2. Files exist at the expected path
3. Exports/imports match between files

## 📚 Documentation

For detailed information:
- See [REFACTORING_COMPLETE.md](./REFACTORING_COMPLETE.md) for full refactoring details
- See [FOLDER_STRUCTURE_REFERENCE.md](./FOLDER_STRUCTURE_REFERENCE.md) for complete structure
- See [REFACTOR_PLAN.md](./REFACTOR_PLAN.md) for design decisions

## ✨ Tips & Best Practices

1. **Use @/ paths consistently** - Always use absolute imports with @/
2. **Keep components focused** - Put related components in their own folder
3. **Reuse common components** - Check `common/` before creating new
4. **Keep utilities pure** - Utility functions shouldn't have side effects
5. **Document exports** - Add JSDoc comments to exported functions

## 🆘 Troubleshooting

### "Cannot find module '@/components/...'"
- Check the file actually exists in that path
- Make sure you're using the correct component name (case-sensitive)
- Verify tsconfig.json has the @/ path alias configured

### TypeScript errors after import
- Run `npm run type-check` to see the full error
- Check that types are exported from the module
- Import types with `import type` if needed

### Build fails
- Run `npm run type-check` first to catch TS errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

---

**Happy coding! The new structure makes your codebase more maintainable and scalable.** ✨

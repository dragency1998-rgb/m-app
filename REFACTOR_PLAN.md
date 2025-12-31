# 📋 Folder Refactor Plan - M APP

## Current State Analysis

### Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript 5.3+
- **UI Framework:** React 18.2+
- **Styling:** Tailwind CSS + Bootstrap 5
- **Backend:** Firebase (Auth, Firestore)
- **Icons:** Lucide React
- **Build Tool:** Next.js (built-in)

### Current Structure Issues
```
✗ Mixed concerns (components, hooks, utilities all scattered)
✗ api.ts in utils (should be in services)
✗ No types/types folder
✗ Config files duplicated (root + config/)
✗ No clear separation of concerns
✗ pages/ folder empty (Next.js app router uses app/)
✗ No constants organization
✗ Middleware.ts at root of src (should be with app)
✗ Many markdown files in root (should be in docs/)
✗ No clear feature organization
```

---

## Proposed Industry-Standard Structure

```
m-app/
├── public/                          # Static assets
├── src/
│   ├── app/                         # Next.js App Router (organized routes)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── textile-dashboard/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   ├── examples/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/                  # Reusable Components
│   │   ├── common/                  # Shared across app
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── Alert.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx
│   │   ├── reports/                 # Feature-specific
│   │   │   ├── ReportsModule.tsx
│   │   │   └── ExportModal.tsx
│   │   ├── tables/
│   │   │   └── DataTableExample.tsx
│   │   └── ui/
│   │       └── Card.tsx
│   │
│   ├── lib/                         # Utilities & Libraries
│   │   ├── services/                # API calls
│   │   │   ├── api.ts               # Moved from utils/
│   │   │   └── firebase.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useFirestore.ts
│   │   │   ├── useReports.ts
│   │   │   └── useTextileDashboard.ts
│   │   ├── providers/
│   │   │   └── AuthProvider.tsx
│   │   └── utils/
│   │       ├── formatters.ts
│   │       ├── validators.ts
│   │       └── cn.ts
│   │
│   ├── types/                       # TypeScript definitions (NEW)
│   │   └── index.ts
│   │
│   ├── middleware.ts
│   └── styles/
│       └── globals.css
│
├── docs/                            # Documentation (organized)
│   ├── features/
│   │   ├── export/
│   │   │   └── (EXPORT_FEATURE_*.md files)
│   │   ├── reports/
│   │   │   └── (REPORTING_*.md files)
│   │   └── payment-filter/
│   │       └── (PAYMENT_TYPE_*.md files)
│   ├── guides/
│   │   ├── setup.md
│   │   └── development.md
│   └── (other docs)
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
└── (other root configs)
```

---

## Implementation Phases

### ✅ Phase 1: Analyze & Plan (CURRENT)
- Understand current file structure
- Identify all import paths
- Plan migration strategy

### ⏳ Phase 2: Create Directory Structure
- Create all new directories
- Non-destructive (doesn't delete old files)

### ⏳ Phase 3: Move & Update Files
- Move files to new locations
- Update ALL import paths
- Verify TypeScript compilation

### ⏳ Phase 4: Cleanup
- Delete old empty directories
- Remove duplicate files
- Organize documentation

### ⏳ Phase 5: Verification
- Test build
- Test dev server
- Verify routes work
- Confirm 0 errors

---

## Key Changes

1. **api.ts moved:** `src/utils/api.ts` → `src/lib/services/api.ts`
2. **Components organized:** Feature-based grouping
3. **Documentation moved:** Root `.md` files → `docs/features/`
4. **Types centralized:** New `src/types/` folder
5. **Services added:** New `src/lib/services/` folder

---

## Next Steps

Ready to proceed with implementation?
1. Run Phase 2 (create directories)
2. Execute Phase 3 (move & update)
3. Execute Phase 4 (cleanup)
4. Execute Phase 5 (verify)

**Command to start:** Approve and I'll begin file operations.

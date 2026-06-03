# TODO.md — Task List

## Phase 1: Project Initialization
- [x] Initialize Next.js 14 project with JavaScript, Tailwind CSS, App Router
- [x] Install dependencies: prisma, @prisma/client, decimal.js, next-auth, bcrypt
- [x] Install shadcn/ui and initialize with default config
- [x] Add core shadcn components: button, input, label, card, table, select, dialog, badge, dropdown-menu, separator, textarea, sheet
- [x] Create `.env.example` with empty values for DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- [x] Create `.gitignore` with node_modules, .next, .env.local, .env
> **Commit:** `feat: initialize Next.js 14 project with dependencies`

## Phase 2: Prisma Schema & Database
- [x] Write `prisma/schema.prisma` with all models exactly as specified
- [x] Create `lib/prisma.js` Prisma client singleton
- [x] Generate Prisma client
> **Commit:** `feat: add Prisma schema and client singleton`

## Phase 3: Unit Conversion Library
- [x] Implement `lib/units.js` with toBaseQty, toDisplayQty, calcLineTotal, calcDisplayPrice
- [x] All functions use Decimal from decimal.js
- [x] Add JSDoc comments to each function
> **Commit:** `feat: implement unit conversion library`

## Phase 4: Authentication
- [ ] Configure NextAuth.js v5 with Credentials provider in `lib/auth.js`
- [ ] Create `app/api/auth/[...nextauth]/route.js`
- [ ] Implement login page at `app/login/page.jsx`
- [ ] Add middleware for route protection (`middleware.js`)
- [ ] Role-based redirects: ADMIN → /admin/products, SELLER → /seller/catalog
> **Commit:** `feat: add NextAuth authentication with role-based access`

## Phase 5: Seed Data
- [ ] Create `prisma/seed.js` with:
  - UnitOptions: gram (1), kilogram (1000), millilitre (1), litre (1000), unit (1)
  - Categories: Raw Materials, Solvents, Lab Supplies, Equipment
  - Admin user: admin@example.com / admin123
  - Seller user: seller@example.com / seller123
  - Sample products (5-10) across categories with realistic stock and prices
- [ ] Add seed script to package.json
> **Commit:** `feat: add seed data script`

## Phase 6: Product API Routes
- [ ] `GET /api/products` — list active products (with category, displayUnit); admin sees all
- [ ] `POST /api/products` — create product (admin only)
- [ ] `GET /api/products/[id]` — get single product
- [ ] `PUT /api/products/[id]` — update product (admin only)
- [ ] `DELETE /api/products/[id]` — soft-delete product (admin only, sets isActive=false)
- [ ] All prices/quantities handled via decimal.js
- [ ] Auth guards on mutation routes
> **Commit:** `feat: implement product CRUD API routes`

## Phase 7: Order API Routes
- [ ] `POST /api/orders` — create order with transaction (seller only)
  - Implement exact algorithm from spec
  - Dimension validation
  - Stock sufficiency check
  - Atomic transaction
- [ ] `GET /api/orders` — list orders (admin: all, seller: own only)
- [ ] `GET /api/orders/[id]` — get order with items (admin: any, seller: own only)
- [ ] `PATCH /api/orders/[id]/status` — update order status (admin only)
- [ ] All decimal operations use decimal.js
> **Commit:** `feat: implement order management API routes`

## Phase 8: Admin UI
- [ ] Admin layout with sidebar navigation (Products, Orders)
- [ ] Products page: table with SKU, name, category, stock (display units), price (per display unit), status
- [ ] Add Product dialog/modal with form
- [ ] Edit Product dialog/modal
- [ ] Soft-delete product with confirmation
- [ ] Orders page: table with order ID, seller name, total, status, date
- [ ] Order detail view with line items
- [ ] Update order status dropdown
- [ ] All quantities/prices displayed in display units using lib/units.js
> **Commit:** `feat: build admin dashboard UI`

## Phase 9: Seller UI
- [ ] Seller layout with navigation (Catalog, Cart, My Orders)
- [ ] Catalog page: product grid/list with search and category filter
- [ ] Add to cart with unit selection and quantity input
- [ ] Cart page: line items, unit conversion preview, running total
- [ ] Place order button (calls POST /api/orders)
- [ ] My Orders page: order history with status badges
- [ ] Order detail view
- [ ] All quantities/prices displayed in display units using lib/units.js
> **Commit:** `feat: build seller catalog and order UI`

## Phase 10: Polish & Validation
- [ ] Run through CHECKLIST.md — verify every item
- [ ] Verify all decimal operations use decimal.js
- [ ] Verify no inline unit math outside lib/units.js
- [ ] Test order creation end-to-end
- [ ] Ensure responsive design on mobile
- [ ] Add loading states and error handling
- [ ] Final cleanup and code review
> **Commit:** `chore: final polish and checklist validation`

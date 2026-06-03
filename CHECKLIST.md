# CHECKLIST.md — Acceptance Criteria

## Data Integrity
- [x] All money/quantity math uses `decimal.js` — zero native JS `number` for calculations
- [x] All unit conversion logic is in `lib/units.js` — zero inline arithmetic elsewhere
- [x] Prices stored as INR per base unit in DB
- [x] Stock stored in base units in DB
- [x] UI displays prices per display unit
- [x] UI displays stock in display units
- [x] Order items snapshot `pricePerBaseUnit` at time of order

## Unit Conversions
- [x] `toBaseQty` correctly multiplies displayQty by conversionFactor
- [x] `toDisplayQty` correctly divides baseQty by conversionFactor
- [x] `calcLineTotal` correctly multiplies baseQty by pricePerBaseUnit
- [x] `calcDisplayPrice` correctly multiplies pricePerBaseUnit by conversionFactor
- [x] Dimension mismatch returns 400 error on order creation

## Order Creation
- [x] Wrapped in a single Prisma `$transaction`
- [x] Stock sufficiency validated before decrement
- [x] Stock decremented by correct baseQty
- [x] Each OrderItem stores: orderedQty, orderedUnitId, baseQty, pricePerBaseUnit (snapshot), lineTotalINR
- [x] order.totalINR = sum of all lineTotalINR

## Authentication & Authorization
- [x] Login works with email/password
- [x] Admin can access /admin/* routes
- [x] Seller can access /seller/* routes
- [x] Admin cannot access /seller/* routes
- [x] Seller cannot access /admin/* routes
- [x] API routes enforce role-based access
- [x] Unauthenticated users redirected to /login

## Admin Features
- [x] View all products with stock in display units and price per display unit
- [x] Create new product
- [x] Edit existing product
- [x] Soft-delete product (sets isActive=false)
- [x] View all orders
- [x] View order details with line items
- [x] Update order status (PENDING → CONFIRMED → FULFILLED or CANCELLED)

## Seller Features
- [x] Browse active products catalog
- [x] Search products by name
- [x] Filter products by category
- [x] Add product to cart with unit selection
- [x] View cart with line totals and grand total
- [x] Place order (creates order via API)
- [x] View own order history
- [x] View order details

## Code Quality
- [x] No secrets committed to git
- [x] `.env.example` present with empty values
- [x] Prisma schema matches specification exactly
- [x] All models have correct relations
- [x] Responsive design works on mobile

## Seed Data
- [x] UnitOptions seeded: gram, kilogram, millilitre, litre, unit
- [x] Categories seeded: Raw Materials, Solvents, Lab Supplies, Equipment
- [x] Admin user seeded: admin@example.com
- [x] Seller user seeded: seller@example.com
- [x] Sample products seeded with realistic data

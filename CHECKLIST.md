# CHECKLIST.md — Acceptance Criteria

## Data Integrity
- [ ] All money/quantity math uses `decimal.js` — zero native JS `number` for calculations
- [ ] All unit conversion logic is in `lib/units.js` — zero inline arithmetic elsewhere
- [ ] Prices stored as INR per base unit in DB
- [ ] Stock stored in base units in DB
- [ ] UI displays prices per display unit
- [ ] UI displays stock in display units
- [ ] Order items snapshot `pricePerBaseUnit` at time of order

## Unit Conversions
- [ ] `toBaseQty` correctly multiplies displayQty by conversionFactor
- [ ] `toDisplayQty` correctly divides baseQty by conversionFactor
- [ ] `calcLineTotal` correctly multiplies baseQty by pricePerBaseUnit
- [ ] `calcDisplayPrice` correctly multiplies pricePerBaseUnit by conversionFactor
- [ ] Dimension mismatch returns 400 error on order creation

## Order Creation
- [ ] Wrapped in a single Prisma `$transaction`
- [ ] Stock sufficiency validated before decrement
- [ ] Stock decremented by correct baseQty
- [ ] Each OrderItem stores: orderedQty, orderedUnitId, baseQty, pricePerBaseUnit (snapshot), lineTotalINR
- [ ] order.totalINR = sum of all lineTotalINR

## Authentication & Authorization
- [ ] Login works with email/password
- [ ] Admin can access /admin/* routes
- [ ] Seller can access /seller/* routes
- [ ] Admin cannot access /seller/* routes
- [ ] Seller cannot access /admin/* routes
- [ ] API routes enforce role-based access
- [ ] Unauthenticated users redirected to /login

## Admin Features
- [ ] View all products with stock in display units and price per display unit
- [ ] Create new product
- [ ] Edit existing product
- [ ] Soft-delete product (sets isActive=false)
- [ ] View all orders
- [ ] View order details with line items
- [ ] Update order status (PENDING → CONFIRMED → FULFILLED or CANCELLED)

## Seller Features
- [ ] Browse active products catalog
- [ ] Search products by name
- [ ] Filter products by category
- [ ] Add product to cart with unit selection
- [ ] View cart with line totals and grand total
- [ ] Place order (creates order via API)
- [ ] View own order history
- [ ] View order details

## Code Quality
- [ ] No secrets committed to git
- [ ] `.env.example` present with empty values
- [ ] Prisma schema matches specification exactly
- [ ] All models have correct relations
- [ ] Responsive design works on mobile

## Seed Data
- [ ] UnitOptions seeded: gram, kilogram, millilitre, litre, unit
- [ ] Categories seeded: Raw Materials, Solvents, Lab Supplies, Equipment
- [ ] Admin user seeded: admin@example.com
- [ ] Seller user seeded: seller@example.com
- [ ] Sample products seeded with realistic data

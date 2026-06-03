# CLAUDE.md — Project Rules

## Project Overview
Inventory & Order Management System built with Next.js 14 (App Router), Prisma ORM, Neon PostgreSQL, and deployed on Vercel.

## Tech Stack
- **Framework:** Next.js 14 (App Router, Server Components, Server Actions)
- **Language:** JavaScript (ES Modules)
- **Database:** Neon PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js v5 with Credentials provider (bcrypt password hashing)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Decimal Math:** decimal.js for all money/quantity operations
- **Deployment:** Vercel

## Roles
- **ADMIN** — manages products, views all orders, updates order status
- **SELLER** — browses products, places orders with flexible unit selection

## Hard Rules
1. `decimal.js` for every numeric operation involving money or quantities — no native JS `number`.
2. All unit conversion math lives only in `lib/units.js`. Zero inline arithmetic in components or routes.
3. Prices stored as INR per base unit in DB. Displayed as INR per display unit in UI.
4. Stock stored in base units in DB. Displayed in display units in UI.
5. Order creation must be wrapped in a single Prisma transaction.
6. Products are soft-deleted (`isActive = false`), never hard-deleted.
7. No secrets in git. `.env.local` gitignored. `.env.example` committed with empty values.

## Unit Conversion Rules
- **Base units:** gram (WEIGHT), millilitre (VOLUME), unit (COUNT)
- **Conversion factors:** stored in `UnitOption.conversionFactor`
  - gram → 1, kilogram → 1000
  - millilitre → 1, litre → 1000
  - unit → 1
- `toBaseQty(displayQty, conversionFactor)` = displayQty * conversionFactor
- `toDisplayQty(baseQty, conversionFactor)` = baseQty / conversionFactor
- `calcLineTotal(baseQty, pricePerBaseUnit)` = baseQty * pricePerBaseUnit
- `calcDisplayPrice(pricePerBaseUnit, conversionFactor)` = pricePerBaseUnit * conversionFactor

## Price Display Convention
- DB stores: `pricePerBaseUnit` (e.g., INR per gram)
- UI shows: price per display unit (e.g., INR per kg = pricePerBaseUnit * 1000)

## Stock Display Convention
- DB stores: `stockBaseQty` (e.g., grams)
- UI shows: stock in display unit (e.g., kg = stockBaseQty / 1000)

## Order Creation Algorithm
1. For each item: fetch product, fetch orderedUnit, assert dimension match
2. Calculate baseQty, lineTotalINR using lib/units.js functions
3. Check stock sufficiency (stockBaseQty >= baseQty)
4. Persist OrderItem with snapshot of pricePerBaseUnit
5. Decrement product.stockBaseQty
6. Sum lineTotalINR → order.totalINR
7. All in one Prisma transaction

## Commit Convention
- One commit per task group in TODO.md
- Use the commit message specified in TODO.md

## File Structure
```
app/
  layout.jsx
  page.jsx
  api/
    auth/[...nextauth]/route.js
    products/route.js
    products/[id]/route.js
    orders/route.js
    orders/[id]/route.js
    orders/[id]/status/route.js
    seed/route.js
  admin/
    layout.jsx
    products/page.jsx
    orders/page.jsx
  seller/
    layout.jsx
    catalog/page.jsx
    orders/page.jsx
    cart/page.jsx
components/
  ui/           (shadcn components)
  admin/        (admin-specific components)
  seller/       (seller-specific components)
  shared/       (shared components)
lib/
  prisma.js     (Prisma client singleton)
  units.js      (all unit conversion logic)
  auth.js       (NextAuth config)
  utils.js      (utility functions)
prisma/
  schema.prisma
  seed.js
```

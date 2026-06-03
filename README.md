# Inventory & Order Management System

A full-stack web application for managing product inventory and processing orders, built for AsaMedChem. Features role-based access for Admin and Seller users with precise unit conversion and decimal arithmetic throughout.

**Live Demo:** [inventory-order-management-dusky.vercel.app](https://inventory-order-management-dusky.vercel.app)

## Demo Credentials

| Role   | Email               | Password  |
|--------|---------------------|-----------|
| Admin  | admin@example.com   | admin123  |
| Seller | seller@example.com  | seller123 |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** JavaScript (ES Modules)
- **Database:** PostgreSQL (Neon) via Prisma ORM
- **Auth:** NextAuth.js v5 (Credentials provider, JWT sessions)
- **Styling:** Tailwind CSS + shadcn/ui
- **Decimal Math:** decimal.js for all money/quantity operations
- **Deployment:** Vercel

## Features

### Admin Portal
- View, create, edit, and soft-delete products
- Stock displayed in display units (kg, L, unit), stored in base units (g, mL, unit)
- Prices displayed per display unit, stored per base unit
- View all orders with line item details
- Update order status (Pending → Confirmed → Fulfilled / Cancelled)

### Seller Portal
- Browse product catalog with search and category filtering
- Add products to cart with flexible unit selection (e.g., order in kg or g)
- Cart with live line totals and grand total calculation
- Place orders (atomic transaction with stock validation)
- View order history and details

### Core Architecture
- **Unit Conversion:** All conversion logic centralized in `lib/units.js` — zero inline arithmetic
- **Decimal Precision:** All money/quantity math uses `decimal.js`, never native JS `number`
- **Atomic Orders:** Order creation wrapped in a single Prisma `$transaction` with stock sufficiency checks and price snapshots
- **Dimension Safety:** Orders reject unit/product dimension mismatches (e.g., can't order a weight product in litres)
- **Soft Deletes:** Products are deactivated, never hard-deleted

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)

### Setup

```bash
# Clone the repository
git clone https://github.com/mdarmanahmed2106/Asamedchem_Assignment.git
cd Asamedchem_Assignment

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values:
#   DATABASE_URL=postgresql://...
#   NEXTAUTH_SECRET=<run: openssl rand -base64 32>
#   NEXTAUTH_URL=http://localhost:3000

# Push database schema
npx prisma db push

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  login/page.jsx              # Login page
  admin/
    layout.jsx                # Admin sidebar layout
    products/page.jsx         # Product management
    orders/page.jsx           # Order management
  seller/
    layout.jsx                # Seller sidebar layout
    catalog/page.jsx          # Product catalog
    cart/page.jsx             # Shopping cart
    orders/page.jsx           # Order history
  api/
    auth/[...nextauth]/       # NextAuth API
    products/                 # Product CRUD
    orders/                   # Order CRUD + status
    categories/               # Category listing
    units/                    # Unit options listing
components/
  ui/                         # shadcn/ui components
  admin/                      # Admin-specific components
  seller/                     # Seller-specific (cart context)
lib/
  auth.js                     # NextAuth configuration
  prisma.js                   # Prisma client singleton
  units.js                    # Unit conversion functions
  utils.js                    # Utility functions (cn)
prisma/
  schema.prisma               # Database schema
  seed.js                     # Seed data script
```

## Unit Conversion Model

| Function           | Formula                              | Example                        |
|--------------------|--------------------------------------|--------------------------------|
| `toBaseQty`        | displayQty × conversionFactor        | 2 kg × 1000 = 2000 g          |
| `toDisplayQty`     | baseQty ÷ conversionFactor           | 2000 g ÷ 1000 = 2 kg          |
| `calcLineTotal`    | baseQty × pricePerBaseUnit           | 2000 g × ₹0.45/g = ₹900       |
| `calcDisplayPrice` | pricePerBaseUnit × conversionFactor  | ₹0.45/g × 1000 = ₹450/kg      |

## Database Schema

Six models: **User**, **UnitOption**, **Category**, **Product**, **Order**, **OrderItem**

Four enums: `Role` (ADMIN, SELLER), `Dimension` (WEIGHT, VOLUME, COUNT), `OrderStatus` (PENDING, CONFIRMED, FULFILLED, CANCELLED)

All monetary and quantity fields use `Decimal(20,6)` precision.

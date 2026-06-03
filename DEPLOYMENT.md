# Deployment Guide

This guide details the step-by-step process for deploying the Inventory & Order Management System to **Vercel** with a **Neon PostgreSQL** database.

---

## 1. Database Setup (Neon)

Since this project uses PostgreSQL via Prisma, we recommend [Neon](https://neon.tech/) for serverless Postgres.

1. **Sign Up / Log In**: Go to [neon.tech](https://neon.tech/) and create an account.
2. **Create Project**: Create a new project and select your preferred region.
3. **Get Connection String**: Once the project is created, copy the connection string from the Neon dashboard. It will look like this:
   ```env
   postgresql://<user>:<password>@<endpoint>/neondb?sslmode=require
   ```
4. **Direct URL (Optional but recommended for Prisma)**:
   If using Neon connection pooling, Neon provides two URLs:
   - A pooled connection string (port `5432` or subdomains) for general queries.
   - A direct connection string (port `5432` with `sslmode=require`) for running migrations.
   *(For simple setups, the default connection string works for both).*

---

## 2. Set Up Environment Variables

You will need to configure the following environment variables on your deployment platform (Vercel):

| Variable Name | Description | Example |
|---|---|---|
| `DATABASE_URL` | The PostgreSQL connection string from Neon. | `postgresql://user:password@endpoint/neondb?sslmode=require` |
| `NEXTAUTH_SECRET` | A secure, random 32-character string to encrypt sessions. | Generate one using `openssl rand -base64 32` |
| `NEXTAUTH_URL` | The production URL of your deployment (NextAuth v5 uses this as the base URL). | `https://your-app.vercel.app` |
| `AUTH_TRUST_HOST` | Required by NextAuth v5 when deploying on platforms like Vercel. | `true` |

---

## 3. Deploying to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Push your project code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** > **Project**.
3. Import your Git repository.
4. Expand the **Environment Variables** section and add the variables listed in section 2:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (Use your temporary Vercel URL or production domain)
   - `AUTH_TRUST_HOST` = `true`
5. Click **Deploy**.
   - *Note: Vercel automatically runs `npm run build` which triggers the `postinstall` script `"prisma generate"`. This ensures the Prisma Client is generated inside the build environment.*

### Option B: Via Vercel CLI

If you prefer deploying from the terminal, install the Vercel CLI and deploy:

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Log in to Vercel
vercel login

# Link and deploy (follow the interactive prompts)
vercel
```

Configure your environment variables in the project settings on the Vercel dashboard after linking.

---

## 4. Initializing & Seeding the Database in Production

After your Vercel project is live and connected to your Neon database:

### Step 1: Push the Database Schema
From your local machine, run the schema synchronization command targeting your production database:
```bash
# Push schema to production database
npx cross-env DATABASE_URL="your_neon_production_connection_string" npx prisma db push
```

### Step 2: Seed the Database
Seed the production database with initial categories, unit options, products, and default user accounts:
```bash
# Seed production database
npx cross-env DATABASE_URL="your_neon_production_connection_string" npm run db:seed
```

### Default Credentials Created During Seeding:
- **Admin**: `admin@example.com` / `admin123`
- **Seller**: `seller@example.com` / `seller123`

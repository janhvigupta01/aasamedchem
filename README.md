# AasaMedChem Inventory and Order Management System

A full-stack inventory and quotation management system built for the AasaMedChem Hackathon Assignment.

## Features & Flows

- **Role-Based Authentication:** Clean NextAuth integration with separate flows for `ADMIN` and `BUYER`.
- **Dynamic Quotation Builder:** Buyers can browse the product catalog and select products. The UI supports dynamic unit conversions (e.g., selecting `kg` instead of `g`, or `L` instead of `mL`) and instantly calculates the exact order total in INR based on the product's base rate.
- **Admin Dashboard:** Admins can manage the product catalog (create, update, delete products with base units and base prices) and view incoming orders with details on the exact unit conversions and prices requested.
- **Premium Glassmorphic UI:** Modern and sleek aesthetic without Tailwind (Vanilla CSS/CSS Modules) featuring responsive layouts, glowing gradients, and blur effects.

## Tech Stack & Architecture

- **Frontend & Backend:** Next.js (App Router)
- **Database:** PostgreSQL hosted on Neon Serverless Postgres
- **ORM:** Prisma
- **Auth:** NextAuth.js (Credentials Provider)

The frontend uses Next.js React Server Components (RSC) to fetch data directly from the Neon database for high performance. Client Components are used in the dashboard (via `DashboardClient.tsx`) to handle real-time state changes during the quotation builder flow. Server Actions (`actions.ts`) handle secure data mutation.

## Database Schema & Data Types

The database is modelled to ensure precision and accuracy in pricing calculations.

- **User**: `id`, `email`, `password` (hashed), `role` (`ADMIN`, `BUYER`, `SELLER`)
- **Product**:
  - `basePrice`: `Decimal` (mapped to PostgreSQL `Decimal`). Stores the price per single *base unit* (e.g., price per 1 gram) in INR.
  - `baseUnit`: `Enum` (`G`, `ML`, `COUNT`)
  - `stockQty`: `Decimal` (Available quantity in base units)
- **Order**: `id`, `userId`, `status`, `totalAmount` (`Decimal` INR)
- **OrderItem**:
  - `requestedQty`: `Decimal`
  - `requestedUnit`: `String` (e.g. "kg", "L")
  - `calculatedPrice`: `Decimal`

### Unit Storage and Conversion Strategy

To prevent floating-point inaccuracies and maintain consistency:
1. **Database Storage:** All prices and quantities are stored as `Decimal` in Prisma, which maps to high-precision `NUMERIC` types in PostgreSQL.
2. **Base Units:** The system stores the foundational `basePrice` and `stockQty` anchored to the smallest measurable unit: `G` (grams) for weight, `ML` (milliliters) for volume, and `COUNT` for discrete items.
3. **The Conversion Flow:**
   - When a Buyer selects `2 kg` of a product in the UI, the frontend calls the utility `convertToBaseUnit(2, "kg", "G")`.
   - The utility scales the quantity using fixed multipliers (1 kg = 1000 g, so `2 * 1000 = 2000 g`).
   - The price is computed: `2000 * basePrice`.
   - The order is saved with `requestedQty = 2` and `requestedUnit = "kg"` so that Admins can see exactly what the user inputted, alongside the final `calculatedPrice`.

## Setup & Local Development

1. **Clone & Install:**
   ```bash
   git clone <repository>
   cd placement
   npm install
   ```

2. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://<user>:<password>@<neon_host>/<db>?sslmode=require"
   NEXTAUTH_SECRET="your_secure_random_string"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Database Sync:**
   Push the Prisma schema to Neon:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Run Server:**
   ```bash
   npm run dev
   ```

## Deploying to Vercel

1. Push this repository to GitHub.
2. Go to Vercel and import the repository.
3. In the "Environment Variables" section on Vercel, add your `DATABASE_URL` and `NEXTAUTH_SECRET`.
4. Vercel automatically detects Next.js. Hit "Deploy". 
5. Prisma will auto-generate the client during the Vercel build step (Next.js automatically handles it if `prisma` is a dependency).

## Testing the Application

- **Login Credentials:**
  Navigate to the sign-in page. To act as an Admin, log in with:
  - **Email:** `admin@example.com`
  - **Password:** *(Type any password. The system will automatically create the admin account on the first attempt for testing purposes).*

- **Creating Products (Admin):**
  Once logged in as Admin, create a product (e.g., "Chemical X", Base Unit: `G`, Base Price: `0.05` INR, Stock: `1000000`).

- **Ordering (Buyer):**
  Log out, then create a new user (or log in with a different email/password combo, though the current UI forces the first login to be Admin, and subsequent arbitrary logins to act as Buyers if you just insert them manually or adjust the code).
  As a buyer, select Chemical X, choose `kg` as the unit, enter `5` as quantity, and verify the total calculates correctly to 250 INR!

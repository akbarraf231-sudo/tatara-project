# Sinar Jaya Bakery - Setup Guide

Complete setup instructions for deploying the bakery web app.

## Prerequisites

- Node.js 18+
- Supabase account
- Environment variables configured

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the project root:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Password
ADMIN_PASSWORD=your-secure-password
```

Get these values from your Supabase dashboard:
1. Go to Project Settings > API
2. Copy the project URL and anon key
3. Copy the service role key (keep this secret!)

### 3. Database Setup

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Create a new query and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the query
5. Create another query and paste `supabase/migrations/002_place_order_rpc.sql`
6. Run the query

This will:
- Create all required tables
- Set up relationships
- Create the `place_order` RPC function for orders
- Create indexes for performance

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Overview

### Customer Features

- **Product Browsing**: View all active products with images, prices, and stock
- **Shopping Cart**: Add/remove products, adjust quantities
- **Checkout**: Enter customer name and proceed to payment
- **Payment Methods**:
  - QRIS (QR code payment)
  - Cash (pay at pickup)
  - WhatsApp confirmation
- **Location**: View bakery location via Google Maps link

### Admin Features

Access admin panel by clicking the settings icon in the navbar:

1. **Login**: Enter admin password
2. **Orders Tab**:
   - View all orders with customer names and timestamps
   - See order status (pending, confirmed, completed, cancelled)
   - Update order status
   - View order items and totals
   - Auto-cancel pending orders after 15 minutes

3. **Products Tab**:
   - View all products
   - Add new products
   - Edit product name, price, stock, and status
   - Delete products
   - Toggle active/inactive status

4. **Settings Tab**:
   - Configure WhatsApp number (for order confirmations)
   - Set Google Maps location link
   - Save settings to database

## Deployment on Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Deploy bakery app"
git push origin main
```

### 2. Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the project

### 3. Add Environment Variables

In Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-secure-password
```

### 4. Deploy

Click "Deploy" - Vercel will build and deploy automatically.

## API Endpoints

### Public Endpoints

- `POST /api/orders` - Create new order
- `GET /api/settings` - Get WhatsApp and location settings

### Admin Endpoints (require x-admin-token header)

- `POST /api/admin/products` - Create product
- `PATCH /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product
- `PATCH /api/admin/orders/[id]` - Update order status
- `POST /api/admin-login` - Admin login
- `PUT /api/settings` - Update settings

## Database Schema

### Products
- id: BIGINT (primary key)
- name: TEXT
- price: DECIMAL
- stock: INTEGER
- is_active: BOOLEAN
- created_at, updated_at: TIMESTAMP

### Orders
- id: BIGINT (primary key)
- customer_name: TEXT
- total: DECIMAL
- status: TEXT (pending, confirmed, completed, cancelled)
- created_at, updated_at: TIMESTAMP
- expires_at: TIMESTAMP (auto-cancel after 15 min)

### Order Items
- id: BIGINT (primary key)
- order_id: BIGINT (foreign key)
- product_id: BIGINT (foreign key)
- qty: INTEGER
- price: DECIMAL

### Settings
- id: BIGINT (primary key)
- whatsapp_number: TEXT
- location_link: TEXT

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` file has correct values
- Verify `NEXT_PUBLIC_` prefix for public variables
- Restart dev server after changing env vars

### "Failed to place order"
- Check database tables exist (run SQL migrations)
- Verify `place_order` RPC function exists
- Check product stock is available
- Review browser console for error details

### "Admin login not working"
- Verify `ADMIN_PASSWORD` env variable is set
- Check password is entered correctly
- Make sure service role key is configured

### WhatsApp not working
- Verify WhatsApp number in settings (include country code)
- Test with browser console: `window.location.href = wa.me/...`

## Customization

### Change Colors
Edit Tailwind classes in components - currently using amber (brown) theme:
- `bg-amber-50` to `bg-amber-900` for colors
- Update class names in components

### Change Store Name
Search for "Sinar Jaya" in:
- `/app/layout.tsx` - metadata title
- `/components/Navbar.js` - navbar display
- `/app/page.js` - hero section

### Add Logo Images
Place images in `/public` and reference:
- Logo: `/public/logo.png`
- Small logo: `/public/logo-small.png`

Update references in Navbar component.

## Support

For issues or questions, check the browser console for error messages and verify:
1. Supabase connection is working
2. Environment variables are correct
3. Database schema is set up
4. RPC function exists in Supabase

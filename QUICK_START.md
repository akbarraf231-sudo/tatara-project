# Quick Start Guide - Sinar Jaya Bakery

Get started in 5 minutes.

## ⚡ Super Quick (For Experienced Developers)

```bash
# 1. Clone and install
npm install

# 2. Copy env file
cp .env.example .env.local

# 3. Add your Supabase credentials to .env.local

# 4. Run SQL migrations (supabase/migrations folder)
# - 001_initial_schema.sql
# - 002_place_order_rpc.sql
# - 003_sample_data.sql (optional)

# 5. Start dev server
npm run dev

# 6. Visit http://localhost:3000
```

Done! ✅

---

## 📖 Step-by-Step Setup

### Step 1: Get Prerequisites
- Node.js 18+ ([download](https://nodejs.org))
- Supabase account ([signup](https://supabase.com))
- GitHub account (for deployment)

### Step 2: Install & Configure

```bash
# Install dependencies
npm install

# Create env file
cp .env.example .env.local
```

### Step 3: Get Supabase Credentials

1. Go to [app.supabase.com](https://app.supabase.com)
2. Create new project
3. Wait for project to initialize
4. Go to Project Settings → API
5. Copy these values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service role key → `SUPABASE_SERVICE_ROLE_KEY`
6. Paste into `.env.local`

### Step 4: Set Up Database

1. Go to your Supabase project
2. Click "SQL Editor" 
3. Click "New Query"
4. Copy entire content from `supabase/migrations/001_initial_schema.sql`
5. Paste and click "Run"
6. Create another query for `supabase/migrations/002_place_order_rpc.sql`
7. Paste and click "Run"
8. (Optional) Repeat for `003_sample_data.sql` to add test products

### Step 5: Add Admin Password

In `.env.local`, change:
```
ADMIN_PASSWORD=admin123
```
to:
```
ADMIN_PASSWORD=your-secure-password
```

### Step 6: Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🧪 Quick Tests

### Test Customer Flow
1. ✅ Browse products on homepage
2. ✅ Add item to cart
3. ✅ Go to cart, change quantity
4. ✅ Enter your name and click "Proceed to Payment"
5. ✅ See payment options (QRIS, Cash, WhatsApp)

### Test Admin Panel
1. ✅ Click gear icon (⚙️) in top right
2. ✅ Enter your admin password
3. ✅ Click "Login"
4. ✅ See admin dashboard
5. ✅ Click tabs to see Orders, Products, Settings

---

## 🚀 Deploy to Vercel in 3 Steps

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Initial commit"
git push
```

### Step 2: Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Select your repository
5. Click "Import"

### Step 3: Add Environment Variables
In Vercel project settings, go to "Environment Variables" and add:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
ADMIN_PASSWORD=your-password
```

Click "Deploy" and wait ⏳

Your site is live! 🎉

---

## 📱 Customize for Your Business

### Change Store Name
- Search for "Sinar Jaya" in code
- Replace with your bakery name

### Add Your Logo
1. Save logo as `public/logo.png`
2. Update `components/Navbar.js` to use it

### Change Admin Password
Update `.env.local`:
```
ADMIN_PASSWORD=your-super-secure-password
```

---

## 🆘 Common Issues

### "Missing Supabase environment variables"
- Check `.env.local` file exists
- Check all three env vars are filled in
- Restart dev server (`npm run dev`)

### "Failed to place order"
- Make sure all 3 SQL migrations ran
- Check if `place_order` function exists in Supabase
- Check product stock is not zero

### "Admin login not working"
- Verify `ADMIN_PASSWORD` matches in `.env.local`
- Check password is correct (case-sensitive)
- Try clearing browser localStorage: `localStorage.clear()`

### "Products not showing"
- Check if products table has data
- Run `003_sample_data.sql` to add test products
- Check if products have `is_active = true`

---

## 📚 Full Documentation

- **[README.md](./README.md)** - Project overview
- **[SETUP.md](./SETUP.md)** - Detailed setup guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment
- **[API_REFERENCE.md](./API_REFERENCE.md)** - API documentation

---

## 🔑 Key Files

**Frontend**:
- `app/page.js` - Homepage with products
- `app/admin/page.js` - Admin dashboard

**Components**:
- `components/Navbar.js` - Navigation & admin icon
- `components/Cart.js` - Shopping cart
- `components/PaymentModal.js` - Payment options
- `components/admin/AdminOrders.js` - Order management
- `components/admin/AdminProducts.js` - Product management

**Backend**:
- `app/api/orders/route.js` - Create orders
- `app/api/admin-login/route.js` - Admin authentication
- `app/api/admin/products/route.js` - Product CRUD
- `app/api/admin/orders/[id]/route.js` - Update order status

**Database**:
- `supabase/migrations/001_initial_schema.sql` - Tables & indexes
- `supabase/migrations/002_place_order_rpc.sql` - RPC functions
- `supabase/migrations/003_sample_data.sql` - Sample products

---

## ⭐ What's Included

✅ Complete bakery website
✅ Shopping cart with checkout
✅ Multiple payment methods (QRIS, Cash, WhatsApp)
✅ Admin panel with full control
✅ Order management system
✅ Product management
✅ Settings (WhatsApp, location)
✅ Deployment-ready code
✅ Comprehensive documentation
✅ Example database setup

---

## 🎯 Next Steps

1. ✅ Follow this guide to set up locally
2. ✅ Test all features work
3. ✅ Customize colors and name
4. ✅ Add real products
5. ✅ Deploy to Vercel
6. ✅ Share with customers!

---

**Need help?** Check the full [README.md](./README.md) or [SETUP.md](./SETUP.md)

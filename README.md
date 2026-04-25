# Sinar Jaya Bakery - Web App

A modern, deployment-ready bakery web application built with Next.js and Supabase.

## 🎯 Features

### Customer Features
- ✅ Browse products with stock availability
- ✅ Add to cart with quantity adjustment
- ✅ Checkout with customer name
- ✅ Multiple payment methods:
  - QRIS QR code payment
  - Cash at pickup
  - WhatsApp order confirmation
- ✅ View bakery location on Google Maps
- ✅ Auto-cancellation of pending orders after 15 minutes

### Admin Features
- ✅ Secure admin login with password
- ✅ Order management:
  - View all orders
  - Update order status
  - View order details and items
- ✅ Product management:
  - Add/edit/delete products
  - Manage stock levels
  - Toggle product availability
- ✅ Settings management:
  - Configure WhatsApp number
  - Set Google Maps location link
- ✅ Income tracking (confirmed orders only)

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4
- **UI Colors**: Amber/Brown theme (bakery-themed)

## 📋 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- GitHub account (for deployment)

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase credentials and admin password.

3. **Set up database**
   - Open Supabase dashboard
   - Run SQL migrations from `supabase/migrations/` folder
   - This creates tables and RPC functions

4. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Deploy on Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Select your repository

3. **Add environment variables**
   In Vercel project settings, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`

4. **Deploy**
   - Click "Deploy"
   - Your site is live!

## 📝 Database Schema

### Tables
- **products**: Store product catalog
- **orders**: Customer orders
- **order_items**: Order line items
- **settings**: Store configuration (WhatsApp, location)

### RPC Functions
- `place_order()`: Create orders atomically with stock validation
- `auto_cancel_expired_orders()`: Auto-cancel pending orders after 15 min

## 🔐 Security

- ✅ Admin password checked only on server-side
- ✅ Service role key never exposed to frontend
- ✅ RPC function handles stock safely
- ✅ Input validation on all endpoints
- ✅ Authorization headers for admin operations

## 📁 Project Structure

```
.
├── app/
│   ├── page.js                 # Home page
│   ├── layout.tsx              # Root layout
│   ├── admin/
│   │   └── page.js             # Admin dashboard
│   └── api/
│       ├── orders/route.js      # Create orders
│       ├── settings/route.js    # Get/update settings
│       ├── admin-login/route.js # Admin authentication
│       └── admin/
│           ├── products/        # Product CRUD
│           └── orders/          # Order status update
├── components/
│   ├── Navbar.js               # Navigation bar
│   ├── ProductCard.js          # Product display
│   ├── Cart.js                 # Shopping cart
│   ├── PaymentModal.js         # Payment options
│   ├── AdminLoginModal.js      # Admin login
│   └── admin/
│       ├── AdminOrders.js      # Order management
│       ├── AdminProducts.js    # Product management
│       └── AdminSettings.js    # Settings management
├── lib/
│   ├── supabaseClient.js       # Supabase client (public)
│   ├── supabaseServer.js       # Supabase client (server)
│   └── cartContext.js          # Cart state management
├── public/                      # Static files
└── supabase/migrations/         # Database migrations
```

## 🎨 Customization

### Change Store Name
1. Update `SINAR JAYA BAKERY` in components
2. Update metadata in `app/layout.tsx`
3. Update hero section in `app/page.js`

### Change Colors
- Current theme: Amber/Brown (bakery aesthetic)
- Tailwind classes use `bg-amber-*`, `text-amber-*`
- Modify in any component to change brand colors

### Add Logo
1. Place images in `/public/`
2. Update references in `Navbar.js`

## 🧪 Testing

### Manual Testing Checklist
- [ ] Products load and display correctly
- [ ] Add to cart functionality works
- [ ] Cart updates show correct totals
- [ ] Checkout with customer name succeeds
- [ ] Payment modal shows all methods
- [ ] Admin login works with correct password
- [ ] Can create/edit/delete products
- [ ] Can update order status
- [ ] Settings save and load correctly
- [ ] WhatsApp link works
- [ ] Location link opens Google Maps

## 📚 Additional Resources

- [Detailed Setup Guide](./SETUP.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📄 License

This project is ready for production use.

## 💡 Support

For issues or questions:
1. Check the browser console for error messages
2. Verify environment variables are correct
3. Check Supabase database and RPC functions exist
4. Review the SETUP.md guide for detailed troubleshooting

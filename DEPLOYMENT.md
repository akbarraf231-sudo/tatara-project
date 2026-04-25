# Deployment Checklist - Sinar Jaya Bakery

Complete checklist for deploying to production.

## Pre-Deployment (Before Going Live)

### Code & Git
- [ ] All code changes committed to `main` branch
- [ ] No sensitive data in code (passwords, API keys)
- [ ] `.env.local` is in `.gitignore` (not committed)
- [ ] README.md updated with current info
- [ ] All dependencies in `package.json` are correct versions

### Local Testing
- [ ] `npm run dev` starts without errors
- [ ] All product pages load correctly
- [ ] Add to cart functionality works
- [ ] Checkout process completes
- [ ] Admin login works with test password
- [ ] Can create/edit/delete products
- [ ] Can update order status
- [ ] Payment modal displays all options
- [ ] WhatsApp link works (test with browser console)

### Database Setup
- [ ] Supabase account created
- [ ] Project created and URLs noted
- [ ] SQL migrations executed (001, 002, 003)
- [ ] Tables created (products, orders, order_items, settings)
- [ ] RPC functions created (place_order)
- [ ] Sample data inserted (or ready for real data)
- [ ] Database backups configured

### Environment Configuration
- [ ] `.env.example` has all required variables
- [ ] `.env.local` created locally with test values
- [ ] Supabase anon key is correct
- [ ] Supabase service role key is correct
- [ ] Admin password is strong and secure
- [ ] No hardcoded sensitive values in code

## Vercel Deployment

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```
- [ ] Code pushed to main branch
- [ ] All commits are clean

### Step 2: Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Sign in or create account
3. Click "New Project"
4. Select your GitHub repository
5. Select the project and click "Import"
- [ ] Vercel project created
- [ ] Framework detected as Next.js

### Step 3: Configure Environment Variables
In Vercel Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
ADMIN_PASSWORD=your-strong-password
```

- [ ] `NEXT_PUBLIC_SUPABASE_URL` added
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added
- [ ] `ADMIN_PASSWORD` set to strong password
- [ ] All values verified (no typos)

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Click the URL to visit your site

- [ ] Build successful (no errors)
- [ ] Website accessible at Vercel URL
- [ ] Domain configured (if using custom domain)

## Post-Deployment Testing

### Functionality Tests
- [ ] Homepage loads and displays products
- [ ] Product images load correctly
- [ ] Cart functionality works
- [ ] Checkout completes without errors
- [ ] Admin login works with your password
- [ ] Can manage products in admin panel
- [ ] Can view and update orders
- [ ] Settings page saves WhatsApp number
- [ ] Settings page saves location link

### Performance Tests
- [ ] Page loads in under 3 seconds
- [ ] No console errors (F12 → Console)
- [ ] Images are properly optimized
- [ ] Mobile responsive (check on phone)

### Database Tests
- [ ] Sample orders created successfully
- [ ] Order status updates work
- [ ] Stock decreases when order placed
- [ ] Settings load from database
- [ ] WhatsApp number displays correctly

### Security Tests
- [ ] Admin password is required for `/admin`
- [ ] Redirects to home if not logged in
- [ ] Cannot access admin endpoints without token
- [ ] Sensitive keys not visible in frontend code
- [ ] Environment variables not exposed

## Monitoring & Maintenance

### Daily Checks
- [ ] Website is accessible
- [ ] Orders are being placed
- [ ] No errors in Vercel logs
- [ ] Database connection is working

### Weekly Checks
- [ ] Review order logs
- [ ] Check for any errors in admin panel
- [ ] Update product stock if needed
- [ ] Verify settings are saved

### Monthly Checks
- [ ] Check Supabase logs for errors
- [ ] Review analytics (if configured)
- [ ] Update products and prices
- [ ] Test admin functionality
- [ ] Backup database data

## Rollback Plan

If something goes wrong:

### Option 1: Revert Vercel Deployment
1. Go to Vercel Project Settings
2. Click "Deployments"
3. Find the previous working version
4. Click "..." and select "Promote to Production"

### Option 2: Emergency Fix
1. Fix code locally
2. Commit and push to GitHub
3. Vercel auto-deploys from main branch
4. Monitor build progress

### Option 3: Database Recovery
- Contact Supabase support to restore from backup
- Or manually restore from SQL dump

## Custom Domain Setup (Optional)

If using a custom domain:

1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Vercel will show DNS records to add
4. Update DNS settings at your domain registrar
5. Wait for DNS propagation (up to 48 hours)

- [ ] Custom domain configured
- [ ] SSL certificate auto-renewed (Vercel handles this)
- [ ] Domain resolves to Vercel URL

## Performance Optimization Tips

- [ ] Enable Vercel Analytics (Project Settings → Analytics)
- [ ] Configure database indexes (check SQL migrations)
- [ ] Enable Supabase caching if needed
- [ ] Use CDN for images (Vercel does this automatically)
- [ ] Monitor bundle size with `npm run build`

## Scaling Considerations

When you grow:

- [ ] Set up Supabase read replicas for high traffic
- [ ] Configure automatic order notifications
- [ ] Set up monitoring/alerting for downtime
- [ ] Plan for multi-language support
- [ ] Consider inventory management system

## Troubleshooting Production Issues

### Site not loading
- Check Vercel deployment logs
- Verify environment variables are set
- Test Supabase connection

### Admin not working
- Verify `ADMIN_PASSWORD` env variable
- Check if admin token is in localStorage
- Try clearing browser cache

### Orders not creating
- Verify Supabase tables exist
- Check RPC function is created
- Review browser console errors
- Check Supabase logs

### WhatsApp not working
- Verify WhatsApp number in settings
- Test link: `https://wa.me/62812345678?text=test`
- Check if number includes country code

## Support Resources

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- Emergency: Check project `.env.example` for configuration

---

**Deployment Date**: __________
**Deployed By**: __________
**Notes**: ________________________

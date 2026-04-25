# API Reference - Sinar Jaya Bakery

Complete API documentation for the bakery system.

## Public Endpoints (No Authentication)

### Create Order
**POST** `/api/orders`

Create a new order using the RPC function.

**Request Body**:
```json
{
  "items": [
    {
      "product_id": 1,
      "qty": 2
    }
  ],
  "customer_name": "John Doe"
}
```

**Response** (Success - 201):
```json
{
  "success": true,
  "order_id": 123,
  "total": 50000,
  "customer_name": "John Doe"
}
```

**Response** (Error - 400/500):
```json
{
  "success": false,
  "error": "Insufficient stock for product"
}
```

**Error Cases**:
- Missing required fields
- Product not found
- Insufficient stock
- Database errors

---

### Get Settings
**GET** `/api/settings`

Get public settings (WhatsApp number, location link).

**Response** (200):
```json
{
  "success": true,
  "data": {
    "whatsapp_number": "+62812345678",
    "location_link": "https://maps.google.com/..."
  }
}
```

---

### Admin Login
**POST** `/api/admin-login`

Authenticate as admin and get token.

**Request Body**:
```json
{
  "password": "your-admin-password"
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "token": "base64-encoded-token",
  "message": "Login successful"
}
```

**Response** (Error - 401):
```json
{
  "success": false,
  "error": "Invalid password"
}
```

**Usage**:
- Store token in localStorage
- Use token in `x-admin-token` header for admin endpoints

---

## Admin Endpoints (Requires Authentication)

All admin endpoints require:
```
Header: x-admin-token: <token-from-login>
```

### Create Product
**POST** `/api/admin/products`

Create a new product.

**Request Body**:
```json
{
  "name": "Croissant",
  "price": 25000,
  "stock": 50,
  "is_active": true
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Croissant",
    "price": 25000,
    "stock": 50,
    "is_active": true,
    "created_at": "2024-04-25T10:00:00Z"
  }
}
```

---

### Update Product
**PATCH** `/api/admin/products/:id`

Update an existing product.

**Request Body** (all fields optional):
```json
{
  "name": "Croissant Deluxe",
  "price": 30000,
  "stock": 45,
  "is_active": true
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Croissant Deluxe",
    "price": 30000,
    "stock": 45,
    "is_active": true
  }
}
```

---

### Delete Product
**DELETE** `/api/admin/products/:id`

Delete a product.

**Response** (200):
```json
{
  "success": true
}
```

---

### Update Order Status
**PATCH** `/api/admin/orders/:id`

Update order status.

**Request Body**:
```json
{
  "status": "confirmed"
}
```

**Valid Statuses**:
- `pending` - Order just placed
- `confirmed` - Admin confirmed order
- `completed` - Order fulfilled
- `cancelled` - Order cancelled

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 123,
    "customer_name": "John Doe",
    "total": 50000,
    "status": "confirmed",
    "updated_at": "2024-04-25T10:05:00Z"
  }
}
```

---

### Update Settings
**PUT** `/api/settings`

Update WhatsApp number and location link.

**Request Body**:
```json
{
  "whatsapp_number": "+62812345678",
  "location_link": "https://maps.google.com/maps?q=Bakery"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "whatsapp_number": "+62812345678",
    "location_link": "https://maps.google.com/maps?q=Bakery",
    "updated_at": "2024-04-25T10:00:00Z"
  }
}
```

---

## RPC Functions

### place_order()

Server-side RPC function for atomic order processing.

**Parameters**:
- `p_items`: JSONB array of items with `product_id` and `qty`
- `p_customer_name`: Customer name string

**Returns**:
```json
{
  "success": true,
  "order_id": 123,
  "total": 50000,
  "customer_name": "John Doe"
}
```

**Behavior**:
- Validates stock availability
- Creates order record
- Creates order items
- Deducts stock from products
- All operations atomic (all succeed or all fail)

**Called By**: `/api/orders` endpoint

---

### auto_cancel_expired_orders()

Cancels pending orders older than 15 minutes.

**Parameters**: None

**Returns**: void

**Usage**: Call periodically via Supabase cron job or scheduled task

**Behavior**:
- Finds all pending orders > 15 minutes old
- Updates status to 'cancelled'
- Can be called multiple times safely

---

## Database Queries

### Get All Products
```javascript
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true);
```

### Get Order with Items
```javascript
const { data } = await supabase
  .from('orders')
  .select(`
    *,
    order_items(
      id,
      product_id,
      qty,
      price,
      products(name)
    )
  `)
  .eq('id', orderId);
```

### Get Orders by Status
```javascript
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('status', 'confirmed')
  .order('created_at', { ascending: false });
```

### Get Settings
```javascript
const { data } = await supabase
  .from('settings')
  .select('*')
  .limit(1)
  .single();
```

---

## Error Responses

### Common Error Codes

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Missing required fields | Input validation failed |
| 401 | Unauthorized | Invalid/missing admin token |
| 500 | Database error | Server error |
| 500 | RPC function error | Stock validation or insert failed |

### Error Response Format
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

---

## Authentication

### Token-Based Auth
1. Call `/api/admin-login` with password
2. Receive base64-encoded token
3. Include token in `x-admin-token` header
4. Token stored in localStorage (client-side)
5. No server-side session needed

### Security Notes
- Token is simple base64 encoding (for demo)
- Production: Consider JWT tokens
- Always use HTTPS in production
- Service role key never exposed to frontend
- Admin password checked server-side only

---

## Rate Limiting

No built-in rate limiting currently.

**Recommendations**:
- Implement rate limiting on Vercel Edge Middleware
- Use Supabase PostgreSQL's rate limiting
- Monitor API usage in Vercel Analytics

---

## Examples

### JavaScript/Fetch
```javascript
// Create order
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{ product_id: 1, qty: 2 }],
    customer_name: 'John Doe'
  })
});
const data = await response.json();
console.log(data.order_id);
```

### Admin API Call
```javascript
// Update order status
const token = localStorage.getItem('adminToken');
const response = await fetch('/api/admin/orders/123', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-token': token
  },
  body: JSON.stringify({ status: 'confirmed' })
});
const data = await response.json();
```

### React Hook
```javascript
// In a component
const [loading, setLoading] = useState(false);

async function placeOrder(items, name) {
  setLoading(true);
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, customer_name: name })
    });
    const data = await res.json();
    if (data.success) {
      console.log('Order ID:', data.order_id);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    setLoading(false);
  }
}
```

---

## Future Enhancements

- [ ] JWT authentication instead of base64
- [ ] Rate limiting middleware
- [ ] Order notifications via email/SMS
- [ ] Product image upload API
- [ ] Inventory analytics API
- [ ] Payment gateway integration
- [ ] Multi-user admin accounts
- [ ] Audit logging for admin actions

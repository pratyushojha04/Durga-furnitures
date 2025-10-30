# Order Creation 400 Error - Debug Summary

## Problem
Users experiencing repeated 400 Bad Request errors when placing orders.

## Root Cause Identified
**Critical Bug**: The regex pattern in `Checkout.jsx` line 218 was only matching lowercase hexadecimal characters `[a-f0-9]`, but MongoDB ObjectIds contain uppercase letters too. This prevented the frontend from correctly extracting product IDs from error messages and removing unavailable items from the cart.

### Before (Broken):
```javascript
const match = msg.match(/Product ID ([a-f0-9]+)/);
```

### After (Fixed):
```javascript
const match = msg.match(/Product ID ([a-zA-Z0-9]+)/);
```

## Changes Made

### 1. Fixed Product ID Extraction Bug (Frontend)
- **File**: `frontend/src/pages/Checkout.jsx`
- **Line**: 218
- **Fix**: Updated regex to match both uppercase and lowercase characters

### 2. Added Comprehensive Debug Logging (Backend)
- **File**: `backend/app/routes/orders.py`
- **Changes**:
  - Logs user email and phone number validation
  - Logs each order item being processed
  - Logs product validation (found/not found/stock levels)
  - Logs validation failures with specific reasons
  - Logs successful order completion

### 3. Added Comprehensive Debug Logging (Frontend)
- **File**: `frontend/src/pages/Checkout.jsx`
- **Changes**:
  - Logs cart contents on checkout page load
  - Logs order request payload before sending
  - Logs detailed error response data
  - Logs extracted unavailable product IDs

## Testing Instructions

1. **Restart the backend server** to load the updated code with logging
2. **Clear browser cache** and reload the frontend
3. **Attempt to place an order** with items in cart
4. **Check the logs**:
   - **Backend logs** will show:
     ```
     === ORDER REQUEST DEBUG ===
     User email: <email>
     Number of items: <count>
     Product found: <name> - Stock: <num>, Requested: <num>
     ```
   - **Frontend console** will show:
     ```
     === CHECKOUT INITIALIZED ===
     === PLACING ORDER ===
     Order request: { items: [...] }
     ```

## Common Issues to Check

1. **Phone Number Missing**: Backend requires users to have a phone number before placing orders
   - Error: "Phone number is required before placing an order."
   - Fix: Ensure user has phone number set (should trigger PhoneNumberModal)

2. **Product Not Found**: Product ID doesn't exist in database
   - Error: "Product ID <id>: Not found"
   - Fix: Verify product IDs in cart match database

3. **Insufficient Stock**: Requested quantity exceeds available stock
   - Error: "Product ID <id> (<name>): Insufficient stock (available: X, requested: Y)"
   - Fix: Reduce quantity or restock product

4. **Invalid Product ID Format**: Product ID is not a valid MongoDB ObjectId
   - Error: "Product ID <id>: Invalid ID format"
   - Fix: Check cart data structure

## Next Steps

1. Monitor the logs when reproducing the issue
2. Share the logged output to identify the specific validation failure
3. If issues persist, check:
   - User authentication state
   - Cart data structure
   - Database connectivity
   - Product stock levels

## Removed Debug Logging (Optional)

Once the issue is resolved, you can remove the debug logging by:
- Removing `console.log` statements from frontend
- Removing `print` statements from backend
- Or leave them for future debugging (recommended)

---

# Stock Decrement Issue - RESOLVED (Oct 30, 2025)

## Problem
Users were getting "insufficient stock" errors when trying to place orders, even though they had successfully added items to their cart.

## Root Cause
1. **Stock is correctly decremented only when orders are placed** (in `backend/app/routes/orders.py` lines 110-114) ✅
2. **Cart is stored in localStorage** on the frontend - it doesn't sync with real-time stock levels
3. When a product goes out of stock after being added to cart, the cart still shows it
4. The `/api/products` endpoint filters out products with `stock <= 0`, but cart items persist in localStorage

## Solution Implemented
1. **Added new backend endpoint** (`POST /api/products/validate-cart`) that fetches products without stock filtering
2. **Updated Checkout page** to validate stock levels when the page loads:
   - Automatically removes out-of-stock items
   - Adjusts quantities that exceed available stock
   - Shows clear warnings to users about changes
   - Updates both local cart and context cart

## Files Modified
- `backend/app/routes/products.py` - Added `/api/products/validate-cart` endpoint (lines 103-121)
- `frontend/src/pages/Checkout.jsx` - Added stock validation on page load (lines 138-214)

## How It Works Now
1. User adds items to cart (stored in localStorage)
2. When user goes to checkout, the page validates all cart items against current stock
3. Out-of-stock items are removed automatically
4. Items with insufficient stock have quantities adjusted to available stock
5. User sees clear warnings about any changes
6. Order placement only proceeds with valid, in-stock items
7. **Stock is decremented ONLY when the order is successfully placed** ✅

## Key Point
**The cart does NOT decrement stock** - it's purely a frontend feature stored in localStorage. Stock is only decremented on the backend when `POST /api/orders` successfully completes.

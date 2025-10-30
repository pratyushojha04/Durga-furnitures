from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from app.database import db
from app.utils.email import send_order_email, send_processed_order_email
from app.utils.excel_export import save_order_to_excel
from app.utils.auth import get_current_user, get_admin_user
import os
from pydantic import BaseModel
from typing import List
from bson import ObjectId

router = APIRouter()

class OrderItem(BaseModel):
    product_id: str
    quantity: int

class OrderRequest(BaseModel):
    items: List[OrderItem]

@router.post("/orders")
async def create_order(order: OrderRequest, user: dict = Depends(get_current_user)):
    # Debug logging
    print(f"\n=== ORDER REQUEST DEBUG ===")
    print(f"User email: {user['email']}")
    print(f"Number of items: {len(order.items)}")
    for idx, item in enumerate(order.items):
        print(f"  Item {idx}: product_id={item.product_id}, quantity={item.quantity}")
    
    user_data = await db.users.find_one({"email": user["email"]})
    if not user_data:
        print(f"ERROR: User data not found for {user['email']}")
        raise HTTPException(status_code=400, detail="User not found")
    
    if not user_data.get("phone_number"):
        print(f"ERROR: Phone number missing for user {user['email']}")
        raise HTTPException(status_code=400, detail="Phone number is required before placing an order.")
    
    print(f"User phone: {user_data.get('phone_number')}")
    user_email = user_data["email"]
    phone_number = user_data["phone_number"]
    
    # First pass: Validate all items and collect unavailable ones
    unavailable_items = []
    validated_items = []
    
    for item in order.items:
        # Convert string product_id to ObjectId for MongoDB query
        try:
            product_oid = ObjectId(item.product_id)
        except Exception as e:
            print(f"ERROR: Invalid product_id format: {item.product_id} - {e}")
            unavailable_items.append(f"Product ID {item.product_id}: Invalid ID format")
            continue
        
        product = await db.products.find_one({"_id": product_oid})
        if not product:
            print(f"ERROR: Product not found: {item.product_id}")
            unavailable_items.append(f"Product ID {item.product_id}: Not found")
            continue
        
        print(f"Product found: {product.get('name')} - Stock: {product['stock']}, Requested: {item.quantity}")
        
        if product["stock"] < item.quantity:
            print(f"ERROR: Insufficient stock for {product.get('name')}")
            unavailable_items.append(f"Product ID {item.product_id} ({product.get('name', 'Unknown')}): Insufficient stock (available: {product['stock']}, requested: {item.quantity})")
            continue
        
        # Item is valid
        print(f"Item validated successfully: {product.get('name')}")
        validated_items.append({
            "item": item,
            "product_oid": product_oid,
            "product": product
        })
    
    # If any items are unavailable, return error with details
    if unavailable_items:
        print(f"\nERROR: Order validation failed. Unavailable items:")
        for item_error in unavailable_items:
            print(f"  - {item_error}")
        print("=== END ORDER REQUEST DEBUG ===\n")
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Some items are unavailable",
                "unavailable": unavailable_items
            }
        )
    
    # Second pass: Process all validated items
    order_details = []
    total_amount = 0
    
    for validated in validated_items:
        item = validated["item"]
        product_oid = validated["product_oid"]
        product = validated["product"]
        
        # Create order
        order_data = {
            "product_id": product_oid,
            "user_email": user_email,
            "phone_number": phone_number,
            "quantity": item.quantity,
            "status": "purchased"
        }
        await db.orders.insert_one(order_data)
        
        # Update stock
        await db.products.update_one(
            {"_id": product_oid},
            {"$set": {"stock": product["stock"] - item.quantity}}
        )
        
        # Prepare email details with subtotal
        subtotal = product['price'] * item.quantity
        total_amount += subtotal
        order_details.append(f"Product: {product['name']}\n  Quantity: {item.quantity}\n  Price per unit: ₹{product['price']:.2f}\n  Subtotal: ₹{subtotal:.2f}")
    
    # Send email with total
    email_body = "\n\n".join(order_details)
    email_body += f"\n\n{'='*40}\nGRAND TOTAL: ₹{total_amount:.2f}\n{'='*40}"
    send_order_email(user_email, phone_number, email_body)
    
    print(f"SUCCESS: Order placed successfully for {user_email}")
    print(f"  Total items: {len(validated_items)}, Total amount: ₹{total_amount:.2f}")
    print("=== END ORDER REQUEST DEBUG ===\n")
    
    return {"status": "ordered", "message": "Order placed successfully!"}

@router.get("/orders/my-orders")
async def get_my_orders(user: dict = Depends(get_current_user)):
    """Get orders for the current logged-in user"""
    orders = await db.orders.find({"user_email": user["email"]}).to_list(100)
    # Convert ObjectId to string and fetch product details
    orders_with_products = []
    for order in orders:
        order['_id'] = str(order['_id'])
        product_id = order['product_id']
        order['product_id'] = str(product_id)
        
        # Fetch product details
        product = await db.products.find_one({"_id": product_id})
        if product:
            order['product_name'] = product.get('name', 'Unknown')
            order['product_price'] = product.get('price', 0)
            order['product_image'] = product.get('image_url', '')
        
        if 'phone_number' in order:
            order['phone_number'] = str(order['phone_number'])
        orders_with_products.append(order)
    return orders_with_products

@router.get("/orders")
async def get_orders(user: dict = Depends(get_admin_user)):
    orders = await db.orders.find().to_list(100)
    # Convert ObjectId to string and fetch product details
    orders_with_products = []
    for order in orders:
        order['_id'] = str(order['_id'])
        product_id = order['product_id']
        order['product_id'] = str(product_id)
        
        # Fetch product details
        product = await db.products.find_one({"_id": product_id})
        if product:
            order['product_name'] = product.get('name', 'Unknown')
            order['product_price'] = product.get('price', 0)
            order['product_image'] = product.get('image_url', '')
        
        if 'phone_number' in order:
            order['phone_number'] = str(order['phone_number'])
        orders_with_products.append(order)
    return orders_with_products

@router.post("/orders/{order_id}/process")
async def process_order(order_id: str, user: dict = Depends(get_admin_user)):
    try:
        object_id = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid order ID format")

    print(f"Processing order: {order_id}")
    order = await db.orders.find_one({"_id": object_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Fetch product details to calculate total_price and add product info
    product = await db.products.find_one({"_id": ObjectId(order['product_id'])})
    if product:
        order['product_name'] = product.get('name', 'Unknown Product')
        order['unit_price'] = product.get('price', 0)
        order['total_price'] = product.get('price', 0) * order.get('quantity', 0)
    else:
        order['product_name'] = 'Unknown Product'
        order['unit_price'] = 0
        order['total_price'] = 0

    try:
        print(f"Sending processed order email to {order['user_email']}...")
        send_processed_order_email(order['user_email'], order)
        print("Email sent successfully.")
    except Exception as e:
        print(f"Error sending email: {e}")
        if "Username and Password not accepted" in str(e):
            raise HTTPException(status_code=500, detail="Email authentication failed. Please check EMAIL_USER and EMAIL_PASSWORD (use App Password for Gmail).")
        raise HTTPException(status_code=500, detail=f"Failed to send user notification email: {e}")

    try:
        print("Saving order to Excel...")
        save_order_to_excel(order)
        print("Order saved to Excel successfully.")
    except Exception as e:
        print(f"Error saving to Excel: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save order to Excel: {e}")

    # Delete the processed order from the active collection
    await db.orders.delete_one({"_id": object_id})
    print(f"Order {order_id} processed and removed from active orders.")

    return {"status": "processed", "order_id": order_id}

@router.get("/orders/reports")
async def list_reports(user: dict = Depends(get_admin_user)):
    reports_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'reports'))
    if not os.path.exists(reports_dir):
        return []
    return [f for f in os.listdir(reports_dir) if f.endswith('.xlsx')]

@router.get("/orders/reports/{filename}")
async def download_report(filename: str, user: dict = Depends(get_admin_user)):
    reports_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'reports'))
    file_path = os.path.join(reports_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(file_path, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename=filename)
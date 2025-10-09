import smtplib
from email.mime.text import MIMEText
from fastapi import HTTPException
import os
from dotenv import load_dotenv

load_dotenv()

def send_order_email(order_details: str):
    """Send an order confirmation email to the company email."""
    company_email = os.getenv("EMAIL_USER")
    email_password = os.getenv("EMAIL_PASSWORD")
    
    if not company_email or not email_password:
        raise HTTPException(status_code=500, detail="Email configuration missing")

    # Email content
    msg = MIMEText(order_details)
    msg["Subject"] = "New Order Notification - Durga Furniture"
    msg["From"] = company_email
    msg["To"] = "opratyush12@gmail.com"  # Hardcoded admin email

    # SMTP configuration (Gmail)
    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()  # Enable TLS
            server.login(company_email, email_password)
            server.send_message(msg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

def send_processed_order_email(user_email: str, order_details: dict):
    """Send an email to the user notifying them that their order has been processed."""
    company_email = os.getenv("EMAIL_USER")
    email_password = os.getenv("EMAIL_PASSWORD")

    if not company_email or not email_password:
        raise HTTPException(status_code=500, detail="Email configuration missing")

    # Email content
    email_body = f"Dear Customer,\n\nYour order has been processed and is on its way!\n\nOrder Details:\n- Order ID: {order_details['_id']}\n- Product ID: {order_details['product_id']}\n- Quantity: {order_details['quantity']}\n\nThank you for shopping with Durga Furnitures!"
    
    msg = MIMEText(email_body)
    msg["Subject"] = f"Your Durga Furnitures Order #{order_details['_id']} Has Been Processed"
    msg["From"] = company_email
    msg["To"] = user_email

    # SMTP configuration (Gmail)
    # Let exceptions propagate to be handled by the caller
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(company_email, email_password)
        server.send_message(msg)
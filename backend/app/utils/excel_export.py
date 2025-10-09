import pandas as pd
import os
from datetime import datetime

REPORTS_DIR = "reports"

if not os.path.exists(REPORTS_DIR):
    os.makedirs(REPORTS_DIR)

def save_order_to_excel(order: dict):
    """Saves a processed order to a monthly Excel file."""
    now = datetime.now()
    month_str = now.strftime("%Y-%m")
    file_path = os.path.join(REPORTS_DIR, f"orders_{month_str}.xlsx")

    # Prepare the new order data
    order_data = {
        "order_id": [str(order['_id'])],
        "user_email": [order['user_email']],
        "product_id": [order['product_id']],
        "quantity": [order['quantity']],
        "status": [order['status']],
        "processed_at": [now.strftime("%Y-%m-%d %H:%M:%S")]
    }
    new_df = pd.DataFrame(order_data)

    # Read existing file or create a new DataFrame
    if os.path.exists(file_path):
        try:
            existing_df = pd.read_excel(file_path)
            updated_df = pd.concat([existing_df, new_df], ignore_index=True)
        except Exception as e:
            # Handle corrupted file by starting fresh
            print(f"Warning: Could not read {file_path}, creating a new one. Error: {e}")
            updated_df = new_df
    else:
        updated_df = new_df

    # Save the updated DataFrame to the Excel file
    updated_df.to_excel(file_path, index=False)

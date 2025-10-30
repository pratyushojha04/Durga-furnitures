import pandas as pd
import os
from datetime import datetime

REPORTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'reports'))

if not os.path.exists(REPORTS_DIR):
    os.makedirs(REPORTS_DIR)

def save_order_to_excel(order: dict):
    """Saves a processed order to a monthly Excel file with detailed information."""
    now = datetime.now()
    month_str = now.strftime("%Y-%m")
    file_path = os.path.join(REPORTS_DIR, f"orders_{month_str}.xlsx")

    # Prepare the new order data with enhanced details
    order_data = {
        "Order ID": [str(order['_id'])],
        "Customer Email": [order['user_email']],
        "Phone Number": [order.get('phone_number', 'N/A')],
        "Product Name": [order.get('product_name', 'Unknown')],
        "Product ID": [str(order['product_id'])],
        "Quantity": [order.get('quantity', 0)],
        "Unit Price (₹)": [order.get('unit_price', 0)],
        "Subtotal (₹)": [order.get('total_price', 0)],
        "Status": [order.get('status', 'processed')],
        "Processed At": [now.strftime("%Y-%m-%d %H:%M:%S")]
    }
    new_df = pd.DataFrame(order_data)

    # Read existing file or create a new DataFrame
    if os.path.exists(file_path):
        try:
            existing_df = pd.read_excel(file_path)
            # Remove summary row if it exists (we'll add a new one)
            if not existing_df.empty and existing_df.iloc[-1]['Order ID'] == 'TOTAL':
                existing_df = existing_df.iloc[:-1]
            updated_df = pd.concat([existing_df, new_df], ignore_index=True)
        except Exception as e:
            # Handle corrupted file by starting fresh
            print(f"Warning: Could not read {file_path}, creating a new one. Error: {e}")
            updated_df = new_df
    else:
        updated_df = new_df

    # Calculate totals for summary row
    total_quantity = updated_df['Quantity'].sum()
    total_amount = updated_df['Subtotal (₹)'].sum()
    total_orders = len(updated_df)
    
    # Add summary row
    summary_row = pd.DataFrame({
        "Order ID": ['TOTAL'],
        "Customer Email": [f'{total_orders} Orders'],
        "Phone Number": [''],
        "Product Name": [''],
        "Product ID": [''],
        "Quantity": [total_quantity],
        "Unit Price (₹)": [''],
        "Subtotal (₹)": [total_amount],
        "Status": [''],
        "Processed At": ['']
    })
    
    final_df = pd.concat([updated_df, summary_row], ignore_index=True)

    # Save the updated DataFrame to the Excel file with formatting
    with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
        final_df.to_excel(writer, index=False, sheet_name='Orders')
        
        # Get the worksheet to apply formatting
        worksheet = writer.sheets['Orders']
        
        # Auto-adjust column widths
        for column in worksheet.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            worksheet.column_dimensions[column_letter].width = adjusted_width

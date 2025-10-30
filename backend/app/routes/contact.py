from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.utils.email import send_contact_email
from app.database import db
from datetime import datetime

router = APIRouter()

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    subject: str
    message: str

@router.post("/contact")
async def submit_contact_form(contact: ContactMessage):
    """
    Handle contact form submissions
    - Save to database
    - Send email notification to admin
    """
    try:
        # Save contact message to database
        contact_data = {
            "name": contact.name,
            "email": contact.email,
            "phone": contact.phone,
            "subject": contact.subject,
            "message": contact.message,
            "created_at": datetime.utcnow(),
            "status": "new"
        }
        
        await db.contact_messages.insert_one(contact_data)
        
        # Send email notification to admin
        send_contact_email(
            name=contact.name,
            email=contact.email,
            phone=contact.phone,
            subject=contact.subject,
            message=contact.message
        )
        
        return {"message": "Thank you for contacting us! We'll get back to you soon."}
    
    except Exception as e:
        print(f"Contact form error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to submit contact form. Please try again or contact us directly."
        )

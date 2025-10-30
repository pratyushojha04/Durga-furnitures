from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import os
from dotenv import load_dotenv
from app.database import db

load_dotenv()
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(
            credentials.credentials,
            os.getenv("SECRET_KEY"),
            algorithms=["HS256"]
        )
        email = payload.get("sub") or payload.get("email")  # Support both 'sub' and 'email' fields
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {str(e)}")

async def get_admin_user(user: dict = Depends(get_current_user)):
    admin_email = os.getenv("ADMIN_EMAIL", "").strip()
    user_email = user.get("email", "")
    print(f"Admin check - Admin email: '{admin_email}', User email: '{user_email}', User role: '{user.get('role')}'")
    
    # Check by role first (more reliable)
    if user.get("role") == "admin":
        return user
    
    # Fallback to email check
    if not admin_email or user_email != admin_email:
        raise HTTPException(
            status_code=403,
            detail=f"Only admin can perform this action. User role: {user.get('role')}"
        )
    return user
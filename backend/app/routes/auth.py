from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import timedelta
import os
from dotenv import load_dotenv
from jose import jwt
from app.database import db
from app.auth.password_utils import (
    get_password_hash, 
    verify_password, 
    create_access_token,
    SECRET_KEY,
    ALGORITHM
)
from app.auth.jwt_handler import get_current_user

load_dotenv()
router = APIRouter()

# Models
class GoogleToken(BaseModel):
    token: str

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: str
    address: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserInDB(UserBase):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class TokenData(BaseModel):
    email: Optional[str] = None

class PhoneUpdate(BaseModel):
    phone_number: str

# Email/Password Authentication

from fastapi.encoders import jsonable_encoder

@router.post("/signup", response_model=Token)
async def signup(user: UserCreate):
    try:
        # Validate input data
        user_data = user.dict()
        
        # Check for missing required fields
        required_fields = ["email", "name", "phone", "address", "password"]
        missing_fields = [field for field in required_fields if not user_data.get(field)]
        if missing_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required fields: {', '.join(missing_fields)}"
            )
            
        # Check email format
        if "@" not in user.email or "." not in user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
            
        # Check password length
        if len(user.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long"
            )
    
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
        # Hash the password
        hashed_password = get_password_hash(user.password)
        
        # Create user document
        user_dict = user.dict()
        user_dict["hashed_password"] = hashed_password
        del user_dict["password"]  # Remove plain password
        
        # Rename 'phone' to 'phone_number' for consistency
        if "phone" in user_dict:
            user_dict["phone_number"] = user_dict.pop("phone")
        
        # Set default role
        admin_email = os.getenv("ADMIN_EMAIL", "").strip()
        user_dict["role"] = "admin" if user.email == admin_email else "user"
        
        # Insert user into database
        result = await db.users.insert_one(user_dict)
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=access_token_expires
        )
        
        # Prepare user data for response
        user_data = {
            "email": user.email,
            "name": user.name,
            "phone_number": user.phone,
            "address": user.address,
            "role": user_dict["role"]
        }
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_data
        }
        
    except Exception as e:
        # Log the error for debugging
        print(f"Error during signup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during signup: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Find user by email
    user = await db.users.find_one({"email": form_data.username})
    if not user or "hashed_password" not in user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=access_token_expires
    )
    
    # Prepare user data for response
    user_data = {
        "email": user["email"],
        "name": user.get("name", ""),
        "phone_number": user.get("phone_number", user.get("phone", "")),  # Support both for backward compatibility
        "address": user.get("address", ""),
        "role": user.get("role", "user")
    }
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }

# Google OAuth
@router.post("/auth/google")
async def google_login(google_token: GoogleToken):
    try:
        idinfo = id_token.verify_oauth2_token(
            google_token.token,
            requests.Request(),
            os.getenv("GOOGLE_CLIENT_ID")
        )
        email = idinfo["email"]
        name = idinfo.get("name", email.split("@")[0])

        # Set role based on email, stripping whitespace from env var
        admin_email = os.getenv("ADMIN_EMAIL", "").strip()
        role = "admin" if admin_email and email == admin_email else "user"

        user = await db.users.find_one({"email": email})
        if not user:
            user = {"email": email, "name": name, "role": role, "phone_number": None}
            await db.users.insert_one(user)
        else:
            # Always update name and role on login
            update_data = {"name": name, "role": role}
            if "phone_number" not in user:
                update_data["phone_number"] = None
            await db.users.update_one({"email": email}, {"$set": update_data})

        # Refetch user to get the latest data
        user = await db.users.find_one({"email": email})


        # Prepare user data for JWT and response, excluding MongoDB's _id
        user_data_for_token = {
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "phone_number": user.get("phone_number")
        }

        jwt_token = jwt.encode(
            user_data_for_token,
            os.getenv("SECRET_KEY"),
            algorithm="HS256"
        )
        return {"token": jwt_token, "user": user_data_for_token}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")

class PhoneUpdate(BaseModel):
    phone_number: str

@router.post("/user/phone")
async def update_phone_number(phone_update: PhoneUpdate, user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"email": user["email"]},
        {"$set": {"phone_number": phone_update.phone_number}}
    )
    return {"message": "Phone number updated successfully"}

@router.get("/auth/google/callback")
async def google_callback(code: str):
    return {"message": "Callback received", "code": code}
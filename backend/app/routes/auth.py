from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from google.oauth2 import id_token
from google.auth.transport import requests
from pydantic import BaseModel
from app.database import db
import os
from dotenv import load_dotenv
from jose import jwt

load_dotenv()
router = APIRouter()

class GoogleToken(BaseModel):
    token: str

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

        # Set role based on email
        role = "admin" if email == os.getenv("ADMIN_EMAIL") else "user"
        
        user = await db.users.find_one({"email": email})
        if not user:
            user = {"email": email, "name": name, "role": role}
            await db.users.insert_one(user)
        else:
            await db.users.update_one({"email": email}, {"$set": {"name": name, "role": role}})

        jwt_token = jwt.encode(
            {"email": email, "name": name, "role": role},
            os.getenv("SECRET_KEY"),
            algorithm="HS256"
        )
        return {"token": jwt_token, "user": {"email": email, "name": name, "role": role}}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")

@router.get("/auth/google/callback")
async def google_callback(code: str):
    return {"message": "Callback received", "code": code}
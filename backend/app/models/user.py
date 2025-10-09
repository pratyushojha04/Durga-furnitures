from pydantic import BaseModel, EmailStr
from typing import Optional

class User(BaseModel):
    email: EmailStr
    name: str
    role: str = "user"  # Default to 'user', set to 'admin' manually in MongoDB

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            str: lambda v: str(v)  # Ensure string conversion for MongoDB _id
        }
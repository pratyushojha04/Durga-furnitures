from pydantic import BaseModel
from typing import Optional

class OrderItem(BaseModel):
    product_id: str
    quantity: int

class Order(BaseModel):
    product_id: str
    user_email: str
    quantity: int
    status: str = "purchased"

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            str: lambda v: str(v)  # Ensure string conversion for MongoDB _id
        }
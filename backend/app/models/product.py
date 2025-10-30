from pydantic import BaseModel
from typing import Optional

class Product(BaseModel):
    name: str
    category: str
    image_url: Optional[str] = None
    price: float
    stock: int = 1
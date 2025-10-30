from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from bson import ObjectId
from app.models.product import Product
from app.database import db
from app.utils.file_upload import upload_image
from app.utils.auth import get_admin_user
from pydantic import BaseModel, validator, ValidationError
from typing import List

router = APIRouter()

class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    stock: int = 1

    @validator('name', 'category')
    def check_length(cls, v):
        if not v or len(v.strip()) < 3:
            raise ValueError('must be at least 3 characters long (excluding leading/trailing spaces)')
        return v.strip()

    @validator('price')
    def check_price(cls, v):
        if v <= 0:
            raise ValueError('must be a positive number')
        return v

@router.post("/products")
async def add_product(
    name: str = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    stock: int = Form(1),
    file: UploadFile = File(None),
    user: dict = Depends(get_admin_user)
):
    try:
        product_data = ProductCreate(name=name, category=category, price=price, stock=stock)
        
        image_url = None
        if file:
            # Validate file type
            if not file.content_type.startswith('image/'):
                raise HTTPException(status_code=422, detail="Only image files (JPEG, PNG) are allowed.")
            # Validate file size (max 5MB)
            max_size = 5 * 1024 * 1024  # 5MB in bytes
            content = await file.read()
            if len(content) > max_size:
                raise HTTPException(status_code=422, detail="File size exceeds 5MB limit.")
            
            # Reset file pointer
            await file.seek(0)
            
            image_url = upload_image(file)
        product = Product(
            name=product_data.name,
            category=product_data.category,
            image_url=image_url,
            price=product_data.price,
            stock=product_data.stock
        )
        result = await db.products.insert_one(product.dict())
        return {"status": "added", "product_id": str(result.inserted_id)}
    except ValidationError as e:
        # Format validation errors properly
        errors = []
        for error in e.errors():
            field = error['loc'][0] if error['loc'] else 'unknown'
            errors.append(f"{field}: {error['msg']}")
        raise HTTPException(status_code=422, detail="; ".join(errors))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add product: {str(e)}")

@router.delete("/products/{id}")
async def remove_product(id: str, user: dict = Depends(get_admin_user)):
    try:
        object_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    result = await db.products.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "removed"}

@router.get("/products")
async def get_products(limit: int = 100, productIds: List[str] = None):
    query = {"stock": {"$gt": 0}}
    if productIds:
        query["_id"] = {"$in": productIds}
    cursor = db.products.find(query)
    products = await cursor.to_list(length=limit)
    # Convert ObjectId to string for JSON serialization
    products_serializable = [
        {**product, '_id': str(product['_id'])} for product in products
    ]
    return products_serializable

@router.post("/products/validate-cart")
async def validate_cart_items(product_ids: List[str]):
    """
    Fetch products by IDs without stock filter - used for cart validation.
    Returns all products regardless of stock level.
    """
    try:
        object_ids = [ObjectId(pid) for pid in product_ids]
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID format")
    
    cursor = db.products.find({"_id": {"$in": object_ids}})
    products = await cursor.to_list(length=len(product_ids))
    
    # Convert ObjectId to string for JSON serialization
    products_serializable = [
        {**product, '_id': str(product['_id'])} for product in products
    ]
    return products_serializable
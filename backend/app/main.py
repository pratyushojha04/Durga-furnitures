from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
#from fastapi.staticfiles import StaticFiles
from app.routes import auth, products, orders, contact
from app.database import init_db, ping_db
import asyncio
from contextlib import asynccontextmanager
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    await ping_db()
    await init_db()
    yield
    # Shutdown tasks (optional, add if needed)
    print("Application shutting down")

app = FastAPI(lifespan=lifespan)

# Serve static files (images)
#app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS configuration - Allow all origins for deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(auth.router)
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(contact.router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 10000))  # Default to 10000 if PORT not set
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)  # Disable reload in production
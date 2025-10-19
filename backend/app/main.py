from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
#from fastapi.staticfiles import StaticFiles
from app.routes import auth, products, orders
from app.database import init_db, ping_db
import asyncio
from contextlib import asynccontextmanager
app = FastAPI()

# Serve static files (images)
#app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    await ping_db()
    await init_db()
    yield
    # Shutdown tasks (optional, add if needed)
    print("Application shutting down")


if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 10000))  # Default to 10000 if PORT not set
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)  # Disable reload in production
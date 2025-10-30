import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB URI from environment
mongo_uri = os.getenv("MONGO_URI")
print(f"Attempting to connect to MongoDB with URI: {mongo_uri}")

if not mongo_uri:
    print("Error: MONGO_URI is not set in environment variables")
    print("Please make sure you have a .env file with MONGO_URI set")
    sys.exit(1)

try:
    # Shorter selection timeout to surface connectivity issues quickly
    print("Creating MongoDB client...")
    client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=5000)
    db = client.get_database()
    print(f"Connected to MongoDB database: {db.name}")
except Exception as e:
    print(f"Error connecting to MongoDB: {str(e)}")
    print(f"Please check if MongoDB is running and accessible at: {mongo_uri}")
    print("For local development, make sure MongoDB is installed and running")
    print("You can download MongoDB from: https://www.mongodb.com/try/download/community")
    sys.exit(1)

# Optional: Test connection on startup
async def ping_db():
    try:
        await db.command("ping")
        print("MongoDB connection successful")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        # Re-raise so startup can fail fast if desired
        raise

# Ensure indexes for better performance
async def init_db():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("name")
    await db.orders.create_index("user_email")
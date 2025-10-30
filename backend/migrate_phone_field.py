"""
Migration script to rename 'phone' field to 'phone_number' in users collection
Run this once to update existing users in the database
"""
import asyncio
from app.database import db

async def migrate_phone_field():
    print("Starting migration: Renaming 'phone' to 'phone_number' in users collection...")
    
    # Find all users with 'phone' field but no 'phone_number' field
    users_to_update = await db.users.find({"phone": {"$exists": True}, "phone_number": {"$exists": False}}).to_list(length=None)
    
    if not users_to_update:
        print("No users found with 'phone' field to migrate.")
        return
    
    print(f"Found {len(users_to_update)} users to migrate.")
    
    # Update each user
    for user in users_to_update:
        phone_value = user.get("phone")
        await db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {"phone_number": phone_value},
                "$unset": {"phone": ""}
            }
        )
        print(f"Migrated user: {user.get('email')}")
    
    print(f"Migration completed! Updated {len(users_to_update)} users.")

if __name__ == "__main__":
    asyncio.run(migrate_phone_field())

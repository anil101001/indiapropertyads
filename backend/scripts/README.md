# Property Duplicate Management Scripts

## Overview
These scripts help identify and clean up duplicate property listings in the database.

## Prerequisites
- Node.js installed
- MongoDB connection configured in `.env`
- Backend dependencies installed (`npm install`)

## Usage

### 1. Find Duplicates
This script identifies duplicate properties based on:
- Property title
- Full address & city
- Owner ID

```bash
cd backend
npm run find-duplicates
```

**Output Example:**
```
🔍 Found 3 sets of duplicate properties:

📋 Property: "Luxury 3BHK Furnished House for Sale | East Facing | 250 Sq.Yds Rampally X Road, Nagaram Hyderabad"
   Location: Hyderabad
   Duplicates: 3 copies
   IDs: 507f1f77bcf86cd799439011, 507f1f77bcf86cd799439012, 507f1f77bcf86cd799439013

📊 Total duplicate entries to clean: 6
```

### 2. Clean Duplicates
This script removes duplicate properties, **keeping the newest version** of each.

```bash
cd backend
npm run clean-duplicates
```

**What it does:**
- Finds all duplicate properties
- Sorts by `createdAt` date (newest first)
- Keeps the newest version
- Deletes older duplicates
- Shows detailed log of what was deleted

**Output Example:**
```
🔍 Finding duplicates...

📋 "Luxury 3BHK Furnished House for Sale"
   Keeping: 507f1f77bcf86cd799439013 (created: 2024-11-22T08:30:00.000Z)
   Deleting: 2 duplicates

🗑️  Deleting 2 duplicate properties...

✅ Deleted 2 duplicate properties!
```

## Safety Notes

⚠️ **Before running `clean-duplicates`:**
1. Always run `find-duplicates` first to review what will be deleted
2. Make a database backup if working with production data
3. The script keeps the **newest** property (highest `createdAt` timestamp)
4. Deleted properties cannot be recovered

## How Duplicates Happen

Duplicates typically occur due to:
1. Multiple form submissions (double-clicking submit button)
2. Network issues causing retry submissions
3. No unique constraints on property fields

## Prevention

To prevent future duplicates, consider:
1. Adding frontend form submission debouncing
2. Implementing a duplicate check before property creation
3. Adding compound unique indexes on key fields
4. Disabling submit button after first click

## Troubleshooting

**"Database connection not established"**
- Check your `.env` file has correct `MONGODB_URI`
- Ensure MongoDB is running
- Verify network connectivity

**"No duplicates found"**
- Good news! Your database is clean
- Or duplicates might use different criteria (check the grouping logic)

## Need Help?

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your MongoDB connection
3. Review the script source code in `scripts/` directory

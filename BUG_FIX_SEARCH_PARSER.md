# Bug Fix: Natural Language Price Search

## Issue
Searching for "Properties under 1 crore" returned properties above ₹1 Crore because the system was treating the query as a literal text search instead of parsing the price constraint.

## Fix Implemented

### 1. Created Search Parser Utility
**File:** `backend/src/utils/searchParser.ts`
- Implemented a regex-based parser to extract:
  - **Price Constraints:** "under X", "above Y", "between X and Y"
  - **Units:** Handles 'crore', 'cr', 'lakh', 'l', 'k'
  - **Bedrooms:** "2bhk", "3 bedroom"
- Returns a cleaned search text (removing the parsed parts) for better text matching.

### 2. Updated Property Controller
**File:** `backend/src/controllers/property.controller.ts`
- Integrated `parseSearchQuery` in `getProperties`.
- **Logic Flow:**
  1. Parse the search query.
  2. Use parsed `minPrice`/`maxPrice` and `bedrooms` as filters.
  3. Use the cleaned text for title/description matching.
  4. **Priority Logic:** Explicit Filters > Parsed Search Filters > User Budget.

## Testing the Fix
1. Search for "Properties under 1 crore" -> Should show properties with price <= ₹1,00,00,000.
2. Search for "3bhk in Mumbai under 2cr" -> Should show 3BHKs in Mumbai <= ₹2 Crores.
3. Search for "between 50 lakhs and 1 crore" -> Should show properties in range ₹50L - ₹1Cr.

The text search will no longer fail by looking for the literal phrase "under 1 crore" in property titles.

# Bug Fix: Mixed Unit Price Ranges

## 🐛 Issue
Searching "Properties between 50 lakhs and 1 crore" returned **0 results** because the parser incorrectly interpreted it as "50 crore to 1 crore" (invalid range).

## 🔍 Root Cause
The original regex only captured the **last unit** and applied it to both numbers:
```javascript
// Old regex captured: 50, 1, "crore"
// Result: 50 crore to 1 crore ❌
```

## ✅ Fix Applied

### Updated Regex Pattern
```javascript
// Old (broken):
/(\d+)\s*(?:to|and|-)\s*(\d+)\s*(cr|crore|lakhs)/i

// New (fixed):
/(\d+)\s*(unit1)?\s*(?:to|and|-)\s*(\d+)\s*(unit2)?/i
```

### New Logic
1. **Capture both units independently**
   - Group 1: First number (50)
   - Group 2: First unit (lakhs) ← NEW
   - Group 3: Second number (1)
   - Group 4: Second unit (crore) ← Already existed

2. **Smart unit application**
   - If both units provided → use them independently
   - If only one unit → apply to both numbers (backward compatible)
   - If no units → use raw numbers

3. **Validation added**
   - Ensures min ≤ max
   - Auto-swaps if user enters them backwards

## 🧪 Test Cases

| Input | Old Behavior | New Behavior |
|-------|--------------|--------------|
| "50 lakhs and 1 crore" | ₹50Cr - ₹1Cr ❌ | ₹50L - ₹1Cr ✅ |
| "50L - 1cr" | ₹50Cr - ₹1Cr ❌ | ₹50L - ₹1Cr ✅ |
| "1 to 2 crore" | ₹1Cr - ₹2Cr ✅ | ₹1Cr - ₹2Cr ✅ |
| "50 to 60 lakhs" | ₹50L - ₹60L ✅ | ₹50L - ₹60L ✅ |
| "between 50 and 60 lakhs" | ₹50L - ₹60L ✅ | ₹50L - ₹60L ✅ |

## 📝 Changes Made

**File:** `backend/src/utils/searchParser.ts`

### Key Improvements:
1. ✅ Regex now captures **4 groups** instead of 3
2. ✅ Each number can have its own unit
3. ✅ Backward compatible with single-unit queries
4. ✅ Auto-swaps min/max if entered in wrong order
5. ✅ Better comments explaining the logic

## 🎯 Result

Users can now search with mixed units naturally:
- ✅ "50 lakhs to 1 crore"
- ✅ "50L - 1cr"
- ✅ "between 50 lakhs and 1 crore"
- ✅ "properties between 50L and 1Cr"

All will correctly return properties in the ₹50,00,000 - ₹1,00,00,000 range.

# 🤖 AI Chat Assistant - Comprehensive Test Scripts

## 🎯 Test Environment Setup

**Frontend URL:** https://indiapropertyads.netlify.app  
**Backend URL:** https://india-property-ads-api.onrender.com/api/v1  
**AI Model:** GPT-4o-mini with Vector Search  
**Vector DB:** MongoDB Atlas with 1536-dimensional embeddings  

---

## 📋 Test Categories

### 1. Basic Search Queries
### 2. Location-Based Queries
### 3. Price-Based Queries
### 4. Bedroom Configuration Queries
### 5. Property Type Queries
### 6. Complex Multi-Filter Queries
### 7. Conversational Queries
### 8. Price Estimation Queries
### 9. Edge Cases & Error Handling
### 10. Performance Tests

---

## 🔍 Test Script 1: Basic Search Queries

### Test 1.1: Simple Property Search
```
Input: "Show me properties in Hyderabad"
Expected Result:
- Returns 10 properties in Hyderabad
- Displays property cards with images
- Shows pricing and basic details
- Includes clickable links to property pages
```

### Test 1.2: Generic Search
```
Input: "Show me some properties"
Expected Result:
- Returns top 5-10 properties from database
- Mixed property types and locations
- Relevant results based on vector similarity
```

### Test 1.3: Very Short Query
```
Input: "2bhk"
Expected Result:
- Returns 2BHK properties across all cities
- Sorted by relevance
- Shows pricing range
```

---

## 🗺️ Test Script 2: Location-Based Queries

### Test 2.1: City Search
```
Input: "Properties in Bangalore"
Expected Result:
- All properties located in Bangalore
- Shows different neighborhoods (Koramangala, Indiranagar, etc.)
- Includes apartments, villas, houses
```

### Test 2.2: Neighborhood Search
```
Input: "Properties in Gachibowli, Hyderabad"
Expected Result:
- Specific to Gachibowli area
- Shows nearby landmarks
- Relevant pricing for that area
```

### Test 2.3: Multiple Cities
```
Input: "Show properties in Mumbai or Delhi"
Expected Result:
- Returns properties from both cities
- Clearly labeled by location
- Sorted by relevance
```

### Test 2.4: State-Based Search
```
Input: "Properties in Karnataka"
Expected Result:
- Returns Bangalore properties (main city in Karnataka)
- May include Pune if state data matches
```

---

## 💰 Test Script 3: Price-Based Queries

### Test 3.1: Budget Range
```
Input: "Properties under 1 crore"
Expected Result:
- Only properties priced below ₹1,00,00,000
- Sorted by price (lowest first)
- Shows price per sqft
```

### Test 3.2: Specific Price Range
```
Input: "Properties between 50 lakhs and 1 crore"
Expected Result:
- Properties in ₹50,00,000 - ₹1,00,00,000 range
- Multiple cities and property types
- Price clearly displayed
```

### Test 3.3: Luxury Properties
```
Input: "Luxury properties above 5 crores"
Expected Result:
- High-end properties only
- Premium locations (Jubilee Hills, Bandra, etc.)
- Detailed amenities shown
```

### Test 3.4: Affordable Housing
```
Input: "Affordable apartments"
Expected Result:
- Budget-friendly properties (₹45L - ₹1Cr)
- 2BHK and 3BHK options
- Good connectivity areas
```

---

## 🛏️ Test Script 4: Bedroom Configuration Queries

### Test 4.1: 2BHK Search
```
Input: "2BHK apartments"
Expected Result:
- Only 2-bedroom properties
- Various price ranges
- Multiple cities
```

### Test 4.2: 3BHK in Specific City
```
Input: "3BHK in Pune"
Expected Result:
- 3-bedroom properties in Pune only
- Shows Hinjewadi, Baner, Koregaon Park areas
- Family-friendly properties
```

### Test 4.3: Large Homes
```
Input: "4BHK houses"
Expected Result:
- 4-bedroom properties
- Villas and independent houses
- Premium pricing
```

---

## 🏠 Test Script 5: Property Type Queries

### Test 5.1: Apartments Only
```
Input: "Show me apartments"
Expected Result:
- Only apartment listings
- No villas or independent houses
- High-rise buildings with amenities
```

### Test 5.2: Villas
```
Input: "Luxury villas in Bangalore"
Expected Result:
- Villa-type properties only
- Premium locations
- Large plot sizes
- Private amenities (pool, garden)
```

### Test 5.3: Independent Houses
```
Input: "Independent houses"
Expected Result:
- Standalone houses
- Not apartments or villas
- Various locations
```

---

## 🎯 Test Script 6: Complex Multi-Filter Queries

### Test 6.1: City + BHK + Budget
```
Input: "2BHK in Hyderabad under 80 lakhs"
Expected Result:
- 2BHK properties in Hyderabad
- Price ≤ ₹80,00,000
- Sorted by relevance
- Shows Gachibowli, Hitech City areas
```

### Test 6.2: Location + Type + Price
```
Input: "Luxury apartments in Mumbai above 3 crores"
Expected Result:
- Apartments only (no villas)
- Mumbai location
- Price > ₹3,00,00,000
- Premium areas (Bandra, Andheri)
```

### Test 6.3: Very Specific Query
```
Input: "3BHK apartment in Koramangala Bangalore with parking under 2 crores"
Expected Result:
- 3BHK apartments
- Koramangala neighborhood
- Bangalore city
- Parking included
- Price ≤ ₹2,00,00,000
```

### Test 6.4: For Sale vs Rent
```
Input: "Properties for sale in Chennai"
Expected Result:
- Only sale listings (not rent)
- Chennai city
- Various property types
```

---

## 💬 Test Script 7: Conversational Queries

### Test 7.1: Natural Language
```
Input: "I'm looking for a family home in Pune"
Expected Result:
- 2BHK or 3BHK properties
- Family-friendly locations
- Good schools nearby
- Pune city
```

### Test 7.2: Question Format
```
Input: "What properties are available in Delhi?"
Expected Result:
- All Delhi properties
- Various types and prices
- Clear list format
```

### Test 7.3: Comparison Query
```
Input: "Which is better - Gachibowli or Jubilee Hills?"
Expected Result:
- Shows properties from both areas
- May include price comparison
- Area descriptions
```

### Test 7.4: Follow-up Query
```
First: "Show me 2BHK in Bangalore"
Second: "What about 3BHK?"
Expected Result:
- Second query understands context
- Shows 3BHK in Bangalore
- Maintains conversation flow
```

---

## 💵 Test Script 8: Price Estimation Queries

### Test 8.1: Simple Estimation
```
Input: "What's the price of 2BHK in Bangalore?"
Expected Result:
- AI analyzes 2BHK properties in Bangalore
- Returns average/median price
- Shows price range (min-max)
- Includes price per sqft
- May show 3-5 comparable properties
```

### Test 8.2: Specific Area Estimation
```
Input: "How much does a 3BHK cost in Gachibowli?"
Expected Result:
- Focuses on Gachibowli area
- 3BHK specific pricing
- Includes recent listings
- Price trends if available
```

### Test 8.3: Property Type Estimation
```
Input: "Villa prices in Mumbai"
Expected Result:
- Villa-specific pricing
- Mumbai luxury market analysis
- High-end property comparisons
- Price range breakdown
```

### Test 8.4: Budget Check
```
Input: "Can I get a 2BHK in Hyderabad for 60 lakhs?"
Expected Result:
- Shows available 2BHK ≤ ₹60L
- Indicates if budget is realistic
- Suggests alternative areas if needed
- Shows closest matches
```

---

## ⚠️ Test Script 9: Edge Cases & Error Handling

### Test 9.1: No Results
```
Input: "Properties in New York"
Expected Result:
- Polite message: "No properties found in New York"
- Suggests available cities
- Lists: Hyderabad, Bangalore, Mumbai, etc.
```

### Test 9.2: Invalid Query
```
Input: "asdfghjkl"
Expected Result:
- Error message: "I didn't understand that"
- Prompts user to rephrase
- Shows example queries
```

### Test 9.3: Empty Query
```
Input: ""
Expected Result:
- Validation error
- Prompts: "Please enter a search query"
```

### Test 9.4: Very Long Query
```
Input: "I am looking for a very specific property with 3 bedrooms and 2 bathrooms in the heart of Bangalore city preferably near tech parks with good connectivity to airport and metro stations and should have modern amenities like gym swimming pool and clubhouse within a budget of 1.5 to 2 crores"
Expected Result:
- AI extracts key filters: 3BHK, Bangalore, near tech parks, ₹1.5-2Cr
- Returns relevant results
- May summarize requirements
```

### Test 9.5: Special Characters
```
Input: "Properties in Bangalore!!! $$$ 2BHK"
Expected Result:
- Handles special characters gracefully
- Extracts: Bangalore, 2BHK
- Shows relevant results
```

### Test 9.6: Unrealistic Budget
```
Input: "Villa in Mumbai for 10 lakhs"
Expected Result:
- Politely indicates budget is too low
- Shows minimum villa prices in Mumbai
- Suggests alternative areas or property types
```

---

## ⚡ Test Script 10: Performance Tests

### Test 10.1: Response Time
```
Input: "Show me properties in Hyderabad"
Expected Result:
- Response within 3-5 seconds
- Includes vector search + GPT processing
- Smooth UI experience
```

### Test 10.2: Multiple Queries
```
Execute 5 queries in sequence:
1. "2BHK in Bangalore"
2. "Properties under 1 crore"
3. "Luxury villas"
4. "3BHK in Pune"
5. "What's the price of 2BHK in Delhi?"

Expected Result:
- All queries respond within acceptable time
- No memory leaks
- Consistent performance
```

### Test 10.3: Large Result Set
```
Input: "Show me all properties"
Expected Result:
- Returns top 10 results (limited)
- Fast response time
- Pagination hint if available
```

---

## 🔧 Test Script 11: UI/UX Tests

### Test 11.1: Property Cards Display
```
Check:
- ✅ Property image displays correctly
- ✅ Title is readable and complete
- ✅ Price formatted correctly (₹1,50,00,000)
- ✅ Location shown clearly
- ✅ BHK configuration visible
- ✅ "View Details" button works
```

### Test 11.2: Chat Widget
```
Check:
- ✅ Widget opens smoothly
- ✅ Input field is accessible
- ✅ Send button works
- ✅ Loading indicator shows during processing
- ✅ Scrolling works for long conversations
- ✅ Close button works
```

### Test 11.3: Property Links
```
Check:
- ✅ Clicking property card navigates to detail page
- ✅ URL format: /properties/:id
- ✅ Back button returns to chat
- ✅ Property detail page loads correctly
```

### Test 11.4: Mobile Responsiveness
```
Check:
- ✅ Chat widget works on mobile
- ✅ Property cards stack properly
- ✅ Images scale correctly
- ✅ Text is readable
- ✅ Buttons are tappable
```

---

## 📊 Test Script 12: Data Accuracy

### Test 12.1: Property Information
```
Query: "2BHK in Gachibowli"
Verify:
- ✅ All returned properties are actually 2BHK
- ✅ All are in Gachibowli/Hyderabad
- ✅ Prices match database
- ✅ Images are relevant
```

### Test 12.2: Price Estimation Accuracy
```
Query: "What's the price of 3BHK in Bangalore?"
Verify:
- ✅ Estimated price is realistic
- ✅ Based on actual listings
- ✅ Comparable properties shown
- ✅ Price range makes sense
```

### Test 12.3: Count Accuracy
```
Query: "How many 2BHK properties in Mumbai?"
Verify:
- ✅ Count matches actual database count
- ✅ Only counts approved properties
- ✅ Filters applied correctly
```

---

## 🎭 Test Script 13: User Scenarios

### Scenario 1: First-Time Home Buyer
```
Persona: Young professional, budget-conscious
Queries:
1. "Affordable 2BHK in Bangalore"
2. "What's the price range?"
3. "Show me properties near tech parks"
4. "Which areas are best for IT professionals?"

Expected Journey:
- Finds budget-friendly options
- Gets price guidance
- Discovers suitable locations
- Makes informed decision
```

### Scenario 2: Family Upgrading
```
Persona: Family with kids, need space
Queries:
1. "3BHK apartments in Pune"
2. "Properties near good schools"
3. "Budget around 1.5 crores"
4. "Show me properties with playground"

Expected Journey:
- Discovers family-friendly properties
- Considers location and amenities
- Finds suitable options within budget
```

### Scenario 3: Luxury Home Seeker
```
Persona: High net worth individual
Queries:
1. "Luxury villas in Mumbai"
2. "Properties above 5 crores"
3. "Show me properties with swimming pool"
4. "What are the best luxury localities?"

Expected Journey:
- Explores premium properties
- Compares luxury amenities
- Finds exclusive listings
```

### Scenario 4: Investment Purpose
```
Persona: Real estate investor
Queries:
1. "Properties for sale in Hyderabad"
2. "What's the price trend?"
3. "Show me properties near upcoming metro stations"
4. "Best ROI areas in Hyderabad"

Expected Journey:
- Analyzes investment potential
- Considers location growth
- Makes data-driven decision
```

---

## ✅ Pass/Fail Criteria

### ✅ PASS Criteria:
- Response time < 5 seconds
- Relevant results returned (≥ 80% accuracy)
- No errors or crashes
- UI displays correctly
- Links work properly
- Price formatting correct
- Location filters accurate
- Images load successfully

### ❌ FAIL Criteria:
- Response time > 10 seconds
- Irrelevant results (< 50% accuracy)
- Error messages displayed
- Broken links
- Missing images
- Incorrect price calculations
- Wrong location filtering
- UI/UX issues

---

## 🚀 Quick Test Commands

### Copy-Paste Test Suite:

```
# Basic Tests
Show me properties in Hyderabad
2BHK apartments in Bangalore
Properties under 1 crore
3BHK in Pune

# Location Tests
Properties in Gachibowli
Show me apartments in Koramangala
Properties near Hitech City

# Price Tests
Affordable properties
Luxury villas above 5 crores
Properties between 50 lakhs and 1 crore

# Complex Tests
2BHK in Hyderabad under 80 lakhs
Luxury apartments in Mumbai above 3 crores
3BHK apartment in Koramangala with parking

# Price Estimation
What's the price of 2BHK in Bangalore?
How much does a villa cost in Mumbai?
Price of 3BHK in Gachibowli?

# Edge Cases
Properties in New York
asdfghjkl
(empty query)
Villa in Mumbai for 10 lakhs
```

---

## 📝 Test Execution Checklist

- [ ] Open https://indiapropertyads.netlify.app
- [ ] Click AI chat widget (bottom right)
- [ ] Run all Basic Search queries
- [ ] Test Location-Based queries
- [ ] Verify Price-Based queries
- [ ] Check Bedroom Configuration queries
- [ ] Test Property Type queries
- [ ] Try Complex Multi-Filter queries
- [ ] Execute Conversational queries
- [ ] Test Price Estimation queries
- [ ] Verify Edge Cases handling
- [ ] Check Performance
- [ ] Test UI/UX elements
- [ ] Verify Data Accuracy
- [ ] Run User Scenarios
- [ ] Click property links → Verify navigation
- [ ] Test mobile responsiveness
- [ ] Document any issues found

---

## 🐛 Common Issues to Watch For

1. **Blank Pages**: Property links not working (check route configuration)
2. **Slow Responses**: Vector search timing out (check backend logs)
3. **No Results**: Vectorization not working (check ENABLE_VECTORIZATION env)
4. **Wrong Results**: Filters not applied correctly (check query parsing)
5. **Images Not Loading**: S3 configuration issue (check AWS credentials)
6. **Chat Not Opening**: Frontend JavaScript error (check browser console)
7. **Price Format Issues**: Currency formatting (check locale settings)

---

## 📊 Test Results Template

```
Test Date: [Date]
Tester: [Name]
Environment: Production / Staging

| Test ID | Query | Expected | Actual | Status | Notes |
|---------|-------|----------|--------|--------|-------|
| 1.1 | "Properties in Hyderabad" | 10 results | 10 results | ✅ PASS | All relevant |
| 1.2 | "2BHK apartments" | 2BHK only | 2BHK only | ✅ PASS | Correct filter |
| ... | ... | ... | ... | ... | ... |

Overall Result: [PASS/FAIL]
Pass Rate: [X/Y tests passed]
```

---

## 🎯 Success Metrics

- **Accuracy**: ≥ 90% of queries return relevant results
- **Performance**: ≥ 95% of queries respond within 5 seconds
- **User Satisfaction**: Intuitive and helpful responses
- **Error Rate**: < 5% failed queries
- **Link Success**: 100% of property links work correctly

---

## 📞 Support

**Issues Found?**
- Check Backend Logs: Render.com dashboard
- Check Frontend Errors: Browser console (F12)
- Review Network Tab: API call responses
- Test Locally: `npm run dev` (frontend + backend)

**Need Help?**
- Review AI_CHAT_SETUP.md for configuration
- Check VECTOR_SEARCH_SETUP.md for embedding issues
- Review embedding.service.ts for vectorization logs

# KOL Matching Backend API Documentation

## 🎉 **Implementation Complete!**

Your backend now includes **3 advanced KOL matching strategies** with pre-seeded test data.

## 🚀 **Backend Architecture Overview**

### **Matching Strategies Implemented:**

1. **Industry/Category Matching** (`/api/matching/kols/:campaignId?strategy=industry`)
   - Matches KOLs based on content categories vs business industry
   - Scoring: Direct industry match (50pts) + Category overlap (30pts) + Fuzzy matching (15pts)

2. **Audience & Budget Matching** (`/api/matching/kols/:campaignId?strategy=budget`) 
   - Matches based on audience size vs campaign budget fit
   - Estimates KOL rates using HK market standards (HK$0.1 per follower + engagement bonus)
   - Scores: Budget fit + Audience size + Engagement quality

3. **Engagement Quality Matching** (`/api/matching/kols/:campaignId?strategy=engagement`)
   - AI-like advanced scoring using engagement patterns, historical performance  
   - Combines: Engagement quality + Historical ROI + Content consistency + Audience alignment

4. **Combined Strategy** (`/api/matching/kols/:campaignId?strategy=combined`)
   - Runs all 3 strategies in parallel and combines with weighted scores
   - Weights: Industry (30%) + Budget (35%) + Engagement (35%)

## 📡 **API Endpoints**

### **1. Get Matching KOLs**
```http
GET /api/matching/kols/:campaignId?strategy=combined&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "campaign-uuid",
      "title": "Campaign Title",
      "industry": "fitness",
      "budget": { "min": 5000, "max": 15000 }
    },
    "matches": [
      {
        "user_id": "kol-uuid",
        "display_name": "Fitness Jenny", 
        "bio": "Hong Kong fitness enthusiast...",
        "categories": ["fitness", "health", "lifestyle"],
        "kol_analytics": [{
          "followers": 75000,
          "engagement_rate": 0.045,
          "platform": "instagram"
        }],
        "matchScore": 95.5,
        "combinedScore": 89.2,
        "estimatedRate": 7500,
        "strategies": ["industry", "budget", "engagement"],
        "matchReasons": [
          "Perfect industry match: fitness",
          "Perfect budget fit: HK$7,500", 
          "Excellent engagement: 4.5%"
        ]
      }
    ],
    "strategy": "combined",
    "confidence": 95,
    "totalMatches": 5,
    "strategyBreakdown": { ... }
  }
}
```

### **2. Get Available Strategies**
```http
GET /api/matching/strategies
Authorization: Bearer <token>
```

### **3. Invite KOLs to Campaign**
```http
POST /api/matching/invite-kols
Authorization: Bearer <token>
Content-Type: application/json

{
  "campaignId": "campaign-uuid",
  "kolIds": ["kol-uuid1", "kol-uuid2"],
  "customMessage": "We'd love to work with you!"
}
```

### **4. KOL Discovery & Search**
```http
GET /api/kols/discover?category=fitness&minFollowers=50000&platform=instagram&limit=20
GET /api/kols/search?query=fitness&limit=10
Authorization: Bearer <token>
```

## 🔧 **Test Data Created**

### **KOLs Available:**
- **Fitness Jenny** - 75K followers, 4.5% engagement (fitness/health)
- **Foodie Alex** - 120K followers, 3.8% engagement (food/restaurants) 
- **Tech David** - 95K followers, 5.2% engagement (technology/gadgets)
- **Fashion Sophia** - 180K followers, 4.1% engagement (fashion/beauty)
- **Travel Kevin** - 65K followers, 4.8% engagement (travel/lifestyle)
- **Gaming Lisa** - 85K followers, 5.6% engagement (gaming/technology)

### **Business Accounts:**
- **GymTech Solutions** - Fitness industry, HK$5-15K budget
- **FoodDelivery Co.** - Food industry, HK$8-25K budget

### **Test Credentials:**
```
KOL: fitness.jenny@example.com / password123
Business: marketing@gymtech.com / password123
```

## 🧪 **Testing the Matching System**

1. **Login as business user** (`marketing@gymtech.com`)
2. **Create a campaign** with fitness industry requirements 
3. **Call matching API** to get recommended KOLs:

```bash
# Example test request (after getting auth token)
curl -X GET "http://localhost:8000/api/matching/kols/CAMPAIGN_ID?strategy=combined&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

## 📊 **Matching Algorithm Details**

### **Industry Matching Algorithm:**
- **Direct Match**: Industry exactly matches KOL categories (+50 points)
- **Category Overlap**: Campaign categories found in KOL categories (+30 points each)
- **Fuzzy Match**: Partial string matching between categories (+15 points)

### **Budget Matching Algorithm:**
- **Rate Estimation**: `followers × 0.1 × engagement_multiplier` (HK$ rates)
- **Perfect Fit**: Estimated rate within budget range (+40 points)
- **Close Fit**: Rate within 20% of max budget (+25 points)
- **Audience Size Tiers**: 100K+ (+30), 50K+ (+25), 10K+ (+20), 1K+ (+10)
- **Engagement Bonus**: 5%+ (+20), 3%+ (+15), 2%+ (+10)

### **Engagement Quality Algorithm:**
- **Engagement Score** (40 points): Quality engagement analysis
- **Historical Performance** (30 points): Past campaign success rates & ROI
- **Content Consistency** (20 points): Regular posting & defined categories  
- **Audience Alignment** (10 points): Demographics matching campaign targets

## ✅ **Integration Points for Frontend**

Your frontend can now:
1. **Browse KOLs** via `/api/kols/discover` and `/api/kols/search`
2. **Get AI recommendations** via `/api/matching/kols/:campaignId`
3. **Compare strategies** by calling different strategy parameters
4. **Send invitations** via `/api/matching/invite-kols`
5. **Track campaign responses** via `/api/matching/campaign-invitations/:campaignId`

## 🎯 **Ready for Hackathon Demo**

Your backend is now ready with:
- ✅ **3 Different matching strategies** working with real algorithms
- ✅ **Pre-seeded realistic test data** (6 KOLs, 2 businesses, sample campaigns)
- ✅ **Full REST API** with proper authentication & authorization
- ✅ **Confidence scoring** and **match reasoning** for explainability
- ✅ **Rate estimation** based on Hong Kong market standards
- ✅ **Comprehensive error handling** and logging

The system can handle **actual campaign matching scenarios** and provides **intelligent KOL recommendations** that would impress judges in a hackathon setting! 🚀
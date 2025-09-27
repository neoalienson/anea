-- Mock data for KOL Matching Platform

-- Insert test users (businesses)
INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('b1111111-1111-1111-1111-111111111111', 'techcorp@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2', 'business', true),
('b2222222-2222-2222-2222-222222222222', 'fashionbrand@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2', 'business', true),
('b3333333-3333-3333-3333-333333333333', 'gamingco@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2', 'business', true);

-- Insert test users (KOLs)
INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('k1111111-1111-1111-1111-111111111111', 'techreviewer@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2', 'kol', true),
('k2222222-2222-2222-2222-222222222222', 'beautyguru@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2', 'kol', true),
('k3333333-3333-3333-3333-333333333333', 'gamingpro@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2', 'kol', true),
('k4444444-4444-4444-4444-444444444444', 'lifestyleblogger@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2', 'kol', true),
('k5555555-5555-5555-5555-555555555555', 'fitnesscoach@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2', 'kol', true);

-- Insert business profiles
INSERT INTO business_profiles (user_id, company_name, industry, company_size, website, description, target_audience, budget_range) VALUES
('b1111111-1111-1111-1111-111111111111', 'TechCorp Solutions', 'Technology', 'medium', 'https://techcorp.com', 'Leading provider of innovative tech solutions', 
 '{"ageRanges": ["18-24", "25-34"], "genders": ["male", "female"], "interests": ["technology", "gadgets"], "locations": ["US", "Canada"]}',
 '{"min": 1000, "max": 5000, "currency": "USD"}'),
('b2222222-2222-2222-2222-222222222222', 'Fashion Forward', 'Fashion', 'small', 'https://fashionforward.com', 'Trendy fashion brand for young professionals',
 '{"ageRanges": ["18-24", "25-34"], "genders": ["female"], "interests": ["fashion", "lifestyle"], "locations": ["US", "UK"]}',
 '{"min": 500, "max": 2000, "currency": "USD"}'),
('b3333333-3333-3333-3333-333333333333', 'Gaming Universe', 'Gaming', 'large', 'https://gaminguniverse.com', 'Premium gaming hardware and accessories',
 '{"ageRanges": ["16-24", "25-34"], "genders": ["male", "female"], "interests": ["gaming", "esports"], "locations": ["Global"]}',
 '{"min": 2000, "max": 10000, "currency": "USD"}');

-- Update business profiles with enhanced SMB intelligence signals (dummy data)
UPDATE business_profiles SET 
    -- Company Information
    legal_business_name = 'TechCorp Solutions LLC',
    business_registration_number = 'TC2018-789456123',
    tax_id = '12-3456789',
    founded_year = 2018,
    business_type = 'LLC',
    
    -- Financial Metrics
    annual_revenue = 2500000.00,
    revenue_growth_rate = 15.5,
    profit_margin = 12.8,
    employee_count = 45,
    employee_growth_rate = 22.0,
    funding_raised = 1200000.00,
    funding_stage = 'Series A',
    
    -- Geographic Presence
    headquarters_address = '{"street": "123 Innovation Drive", "city": "San Francisco", "state": "CA", "country": "USA", "zipcode": "94105"}'::jsonb,
    operating_countries = '["US", "CA", "UK"]'::jsonb,
    office_locations = '[{"city": "San Francisco", "type": "headquarters", "employees": 30}, {"city": "Austin", "type": "satellite", "employees": 15}]'::jsonb,
    retail_locations = 0,
    
    -- Industry & Market Position
    primary_industry = 'Software Development',
    secondary_industries = '["Cloud Computing", "AI/ML", "Cybersecurity"]'::jsonb,
    industry_rank = 45,
    market_share_percentage = 2.3,
    key_competitors = '["TechRival Inc", "Innovation Labs", "CloudTech Solutions"]'::jsonb,
    
    -- Products & Services
    primary_products = '["Enterprise Software Platform", "Cloud Infrastructure", "AI Analytics Tools"]'::jsonb,
    secondary_products = '["Mobile Apps", "IoT Solutions", "Data Analytics"]'::jsonb,
    service_categories = '["Software Development", "IT Consulting", "Cloud Migration"]'::jsonb,
    product_portfolio_size = 12,
    
    -- Online Presence
    linkedin_company_url = 'https://linkedin.com/company/techcorp-solutions',
    linkedin_followers = 8500,
    linkedin_engagement_rate = 0.045,
    google_maps_rating = 4.6,
    google_maps_review_count = 127,
    website_traffic_rank = 125000,
    website_monthly_visitors = 45000,
    domain_authority = 58,
    
    -- Social Media & Reputation
    social_media_presence = '{"twitter": {"followers": 5200, "engagement": 0.035}, "facebook": {"followers": 3100, "engagement": 0.028}}'::jsonb,
    brand_mention_sentiment = 0.75,
    online_reputation_score = 8.2,
    
    -- Business Operations
    business_model = 'B2B',
    revenue_streams = '["Software Licenses", "Subscription Services", "Professional Services", "Training"]'::jsonb,
    target_market_segments = '["Mid-market enterprises", "Tech startups", "Fortune 500"]'::jsonb,
    seasonal_business_patterns = '{"Q4": "peak", "Q1": "steady", "Q2": "growth", "Q3": "moderate"}'::jsonb,
    
    -- Certifications & Compliance
    industry_certifications = '["ISO 27001", "SOC 2 Type II", "AWS Partner Advanced"]'::jsonb,
    compliance_standards = '["GDPR", "CCPA", "HIPAA"]'::jsonb,
    quality_ratings = '{"customer_satisfaction": 4.3, "product_quality": 4.5, "support_quality": 4.1}'::jsonb,
    
    -- Technology & Innovation
    technology_stack = '["React", "Node.js", "AWS", "Python", "Kubernetes", "PostgreSQL"]'::jsonb,
    digital_transformation_score = 8.7,
    innovation_index = 7.8,
    
    -- Partnerships & Network
    key_partnerships = '["AWS", "Microsoft Azure", "Salesforce", "HubSpot"]'::jsonb,
    supplier_network_size = 25,
    customer_segments = '["Enterprise", "SMB", "Startups"]'::jsonb,
    
    -- Risk & Stability
    financial_stability_score = 8.5,
    credit_rating = 'A-',
    business_risk_score = 3.2,
    
    -- Marketing Intelligence
    advertising_spend_annual = 180000.00,
    marketing_channels = '["Digital Advertising", "Content Marketing", "Trade Shows", "Webinars"]'::jsonb,
    brand_awareness_score = 6.8,
    customer_acquisition_cost = 2500.00,
    customer_lifetime_value = 15000.00,
    
    -- ESG & Sustainability
    sustainability_rating = 7.5,
    environmental_certifications = '["Carbon Neutral Certified"]'::jsonb,
    social_responsibility_score = 8.0,
    governance_score = 8.8
WHERE user_id = 'b1111111-1111-1111-1111-111111111111';

UPDATE business_profiles SET 
    -- Company Information
    legal_business_name = 'Fashion Forward Brands Inc',
    business_registration_number = 'FF2020-456789012',
    tax_id = '98-7654321',
    founded_year = 2020,
    business_type = 'Corporation',
    
    -- Financial Metrics
    annual_revenue = 850000.00,
    revenue_growth_rate = 35.2,
    profit_margin = 8.5,
    employee_count = 18,
    employee_growth_rate = 50.0,
    funding_raised = 500000.00,
    funding_stage = 'Seed',
    
    -- Geographic Presence
    headquarters_address = '{"street": "456 Fashion Avenue", "city": "New York", "state": "NY", "country": "USA", "zipcode": "10018"}'::jsonb,
    operating_countries = '["US", "UK", "EU"]'::jsonb,
    office_locations = '[{"city": "New York", "type": "headquarters", "employees": 12}, {"city": "Los Angeles", "type": "showroom", "employees": 6}]'::jsonb,
    retail_locations = 3,
    
    -- Industry & Market Position
    primary_industry = 'Fashion & Apparel',
    secondary_industries = '["E-commerce", "Sustainable Fashion", "Accessories"]'::jsonb,
    industry_rank = 120,
    market_share_percentage = 0.8,
    key_competitors = '["Trendy Styles Co", "Urban Fashion Hub", "Style Central"]'::jsonb,
    
    -- Products & Services
    primary_products = '["Women\'s Professional Wear", "Sustainable Clothing Line", "Fashion Accessories"]'::jsonb,
    secondary_products = '["Handbags", "Jewelry", "Shoes"]'::jsonb,
    service_categories = '["Personal Styling", "Corporate Wardrobe", "Online Fashion Consulting"]'::jsonb,
    product_portfolio_size = 85,
    
    -- Online Presence
    linkedin_company_url = 'https://linkedin.com/company/fashion-forward-brands',
    linkedin_followers = 3200,
    linkedin_engagement_rate = 0.062,
    google_maps_rating = 4.4,
    google_maps_review_count = 89,
    website_traffic_rank = 285000,
    website_monthly_visitors = 22000,
    domain_authority = 42,
    
    -- Social Media & Reputation
    social_media_presence = '{"instagram": {"followers": 15000, "engagement": 0.078}, "tiktok": {"followers": 8500, "engagement": 0.095}, "pinterest": {"followers": 6200, "engagement": 0.045}}'::jsonb,
    brand_mention_sentiment = 0.82,
    online_reputation_score = 7.8,
    
    -- Business Operations
    business_model = 'B2C',
    revenue_streams = '["Direct Sales", "E-commerce", "Wholesale", "Styling Services"]'::jsonb,
    target_market_segments = '["Professional Women 25-45", "Eco-conscious Consumers", "Fashion Enthusiasts"]'::jsonb,
    seasonal_business_patterns = '{"Spring": "peak", "Summer": "moderate", "Fall": "high", "Winter": "steady"}'::jsonb,
    
    -- Certifications & Compliance
    industry_certifications = '["GOTS Certified", "Fair Trade Certified", "B-Corp Pending"]'::jsonb,
    compliance_standards = '["FTC Guidelines", "CPSIA", "GDPR"]'::jsonb,
    quality_ratings = '{"customer_satisfaction": 4.2, "product_quality": 4.4, "delivery_speed": 4.0}'::jsonb,
    
    -- Technology & Innovation
    technology_stack = '["Shopify", "Instagram API", "Google Analytics", "Klaviyo", "Zendesk"]'::jsonb,
    digital_transformation_score = 7.2,
    innovation_index = 8.1,
    
    -- Partnerships & Network
    key_partnerships = '["Sustainable Fabric Suppliers", "Influencer Network", "Fashion Week Partners"]'::jsonb,
    supplier_network_size = 12,
    customer_segments = '["Direct Consumers", "Corporate Clients", "Boutique Retailers"]'::jsonb,
    
    -- Risk & Stability
    financial_stability_score = 6.8,
    credit_rating = 'BBB+',
    business_risk_score = 4.5,
    
    -- Marketing Intelligence
    advertising_spend_annual = 125000.00,
    marketing_channels = '["Social Media Advertising", "Influencer Partnerships", "Fashion Shows", "Email Marketing"]'::jsonb,
    brand_awareness_score = 5.2,
    customer_acquisition_cost = 45.00,
    customer_lifetime_value = 280.00,
    
    -- ESG & Sustainability
    sustainability_rating = 9.2,
    environmental_certifications = '["Sustainable Fashion Certified", "Carbon Neutral Shipping"]'::jsonb,
    social_responsibility_score = 8.8,
    governance_score = 7.5
WHERE user_id = 'b2222222-2222-2222-2222-222222222222';

UPDATE business_profiles SET 
    -- Company Information
    legal_business_name = 'Gaming Universe Corporation',
    business_registration_number = 'GU2015-123456789',
    tax_id = '11-2233445',
    founded_year = 2015,
    business_type = 'Corporation',
    
    -- Financial Metrics
    annual_revenue = 15600000.00,
    revenue_growth_rate = 28.7,
    profit_margin = 18.5,
    employee_count = 250,
    employee_growth_rate = 15.0,
    funding_raised = 8500000.00,
    funding_stage = 'Series B',
    stock_ticker = 'GAME',
    market_cap = 125000000.00,
    
    -- Geographic Presence
    headquarters_address = '{"street": "789 Gaming Boulevard", "city": "Austin", "state": "TX", "country": "USA", "zipcode": "78701"}'::jsonb,
    operating_countries = '["US", "CA", "UK", "DE", "JP", "AU"]'::jsonb,
    office_locations = '[{"city": "Austin", "type": "headquarters", "employees": 120}, {"city": "Seattle", "type": "development", "employees": 80}, {"city": "London", "type": "european_hub", "employees": 50}]'::jsonb,
    retail_locations = 15,
    franchise_count = 8,
    
    -- Industry & Market Position
    primary_industry = 'Gaming & Entertainment',
    secondary_industries = '["Hardware Manufacturing", "Software Development", "E-sports"]'::jsonb,
    industry_rank = 12,
    market_share_percentage = 5.8,
    key_competitors = '["GameTech Pro", "Elite Gaming Corp", "NextGen Hardware"]'::jsonb,
    
    -- Products & Services
    primary_products = '["Gaming Peripherals", "Custom PCs", "Gaming Accessories", "VR Equipment"]'::jsonb,
    secondary_products = '["Gaming Software", "Streaming Equipment", "Mobile Gaming Accessories"]'::jsonb,
    service_categories = '["Custom PC Building", "Gaming Setup Consultation", "E-sports Team Sponsorship"]'::jsonb,
    product_portfolio_size = 150,
    
    -- Online Presence
    linkedin_company_url = 'https://linkedin.com/company/gaming-universe-corp',
    linkedin_followers = 25000,
    linkedin_engagement_rate = 0.038,
    google_maps_rating = 4.8,
    google_maps_review_count = 1250,
    website_traffic_rank = 45000,
    website_monthly_visitors = 185000,
    domain_authority = 72,
    
    -- Social Media & Reputation
    social_media_presence = '{"youtube": {"subscribers": 450000, "engagement": 0.065}, "twitch": {"followers": 280000, "engagement": 0.085}, "twitter": {"followers": 125000, "engagement": 0.042}}'::jsonb,
    brand_mention_sentiment = 0.88,
    online_reputation_score = 9.1,
    
    -- Business Operations
    business_model = 'B2C',
    revenue_streams = '["Product Sales", "Subscription Services", "Sponsorships", "Licensing"]'::jsonb,
    target_market_segments = '["Hardcore Gamers", "E-sports Athletes", "Content Creators", "Gaming Enthusiasts"]'::jsonb,
    seasonal_business_patterns = '{"Q4": "peak", "Q1": "moderate", "Q2": "steady", "Q3": "growth"}'::jsonb,
    
    -- Certifications & Compliance
    industry_certifications = '["FCC Certified", "CE Marked", "RoHS Compliant", "Energy Star"]'::jsonb,
    compliance_standards = '["ISO 9001", "GDPR", "CCPA", "COPPA"]'::jsonb,
    quality_ratings = '{"customer_satisfaction": 4.7, "product_quality": 4.8, "support_quality": 4.5}'::jsonb,
    
    -- Technology & Innovation
    technology_stack = '["Unity", "Unreal Engine", "AWS", "React", "Python", "C++", "Docker"]'::jsonb,
    digital_transformation_score = 9.2,
    innovation_index = 9.5,
    
    -- Partnerships & Network
    key_partnerships = '["Intel", "NVIDIA", "AMD", "Twitch", "YouTube Gaming", "Epic Games"]'::jsonb,
    supplier_network_size = 45,
    customer_segments = '["Individual Gamers", "E-sports Teams", "Gaming Cafes", "Content Creators"]'::jsonb,
    
    -- Risk & Stability
    financial_stability_score = 9.2,
    credit_rating = 'A+',
    business_risk_score = 2.5,
    
    -- Marketing Intelligence
    advertising_spend_annual = 2500000.00,
    marketing_channels = '["Gaming Events", "Influencer Partnerships", "Digital Advertising", "E-sports Sponsorships"]'::jsonb,
    brand_awareness_score = 8.5,
    customer_acquisition_cost = 125.00,
    customer_lifetime_value = 890.00,
    
    -- ESG & Sustainability
    sustainability_rating = 6.8,
    environmental_certifications = '["Responsible Manufacturing", "Recycling Program"]'::jsonb,
    social_responsibility_score = 7.2,
    governance_score = 8.9
WHERE user_id = 'b3333333-3333-3333-3333-333333333333';

-- Insert KOL profiles
INSERT INTO kol_profiles (user_id, display_name, bio, categories, social_links, audience_metrics, content_style, verification_status) VALUES
('k1111111-1111-1111-1111-111111111111', 'TechReviewer Pro', 'Professional tech reviewer with 5+ years experience', 
 '["technology", "reviews", "gadgets"]',
 '[{"platform": "youtube", "url": "https://youtube.com/techreviewerpro", "isVerified": true}]',
 '{"totalFollowers": 150000, "engagementRate": 0.045, "averageViews": 25000, "demographics": {"ageDistribution": {"18-24": 30, "25-34": 45, "35-44": 25}, "genderDistribution": {"male": 70, "female": 30}, "topLocations": ["US", "Canada", "UK"], "topInterests": ["technology", "gadgets", "reviews"]}}',
 '{"postingFrequency": "3-4 times per week", "contentTypes": ["reviews", "unboxing", "tutorials"], "averageVideoLength": 12}',
 'verified'),
('k2222222-2222-2222-2222-222222222222', 'Beauty Guru Maya', 'Beauty and lifestyle content creator', 
 '["beauty", "lifestyle", "fashion"]',
 '[{"platform": "youtube", "url": "https://youtube.com/beautygurumaya", "isVerified": true}, {"platform": "instagram", "url": "https://instagram.com/beautygurumaya", "isVerified": true}]',
 '{"totalFollowers": 85000, "engagementRate": 0.065, "averageViews": 15000, "demographics": {"ageDistribution": {"16-24": 40, "25-34": 35, "35-44": 25}, "genderDistribution": {"male": 15, "female": 85}, "topLocations": ["US", "UK", "Australia"], "topInterests": ["beauty", "fashion", "lifestyle"]}}',
 '{"postingFrequency": "daily", "contentTypes": ["tutorials", "reviews", "vlogs"], "averageVideoLength": 8}',
 'verified'),
('k3333333-3333-3333-3333-333333333333', 'Gaming Pro Alex', 'Professional gamer and content creator', 
 '["gaming", "esports", "entertainment"]',
 '[{"platform": "youtube", "url": "https://youtube.com/gamingproalex", "isVerified": true}, {"platform": "twitch", "url": "https://twitch.tv/gamingproalex", "isVerified": true}]',
 '{"totalFollowers": 220000, "engagementRate": 0.038, "averageViews": 45000, "demographics": {"ageDistribution": {"16-24": 50, "25-34": 35, "35-44": 15}, "genderDistribution": {"male": 80, "female": 20}, "topLocations": ["US", "Germany", "Brazil"], "topInterests": ["gaming", "esports", "technology"]}}',
 '{"postingFrequency": "daily", "contentTypes": ["gameplay", "reviews", "live streams"], "averageVideoLength": 25}',
 'verified'),
('k4444444-4444-4444-4444-444444444444', 'Lifestyle Luna', 'Lifestyle and wellness content creator', 
 '["lifestyle", "wellness", "travel"]',
 '[{"platform": "youtube", "url": "https://youtube.com/lifestyleluna", "isVerified": true}]',
 '{"totalFollowers": 65000, "engagementRate": 0.055, "averageViews": 12000, "demographics": {"ageDistribution": {"18-24": 35, "25-34": 40, "35-44": 25}, "genderDistribution": {"male": 25, "female": 75}, "topLocations": ["US", "Canada", "UK"], "topInterests": ["lifestyle", "wellness", "travel"]}}',
 '{"postingFrequency": "2-3 times per week", "contentTypes": ["vlogs", "tutorials", "reviews"], "averageVideoLength": 15}',
 'verified'),
('k5555555-5555-5555-5555-555555555555', 'Fitness Coach Sam', 'Certified fitness trainer and nutrition expert', 
 '["fitness", "health", "nutrition"]',
 '[{"platform": "youtube", "url": "https://youtube.com/fitnesscoachsam", "isVerified": true}]',
 '{"totalFollowers": 95000, "engagementRate": 0.048, "averageViews": 18000, "demographics": {"ageDistribution": {"18-24": 25, "25-34": 45, "35-44": 30}, "genderDistribution": {"male": 55, "female": 45}, "topLocations": ["US", "Australia", "UK"], "topInterests": ["fitness", "health", "nutrition"]}}',
 '{"postingFrequency": "4-5 times per week", "contentTypes": ["workouts", "nutrition tips", "motivation"], "averageVideoLength": 10}',
 'verified');

-- Update KOL profiles with enhanced signals (dummy data)
UPDATE kol_profiles SET 
    instagram_follower_count = 0,
    youtube_subscriber_count = 150000,
    instagram_engagement_rate = 0.0000,
    youtube_engagement_rate = 0.0450,
    topics_covered_youtube = '["smartphone reviews", "laptop reviews", "gadget unboxing", "tech tutorials", "comparison videos"]'::jsonb,
    topics_covered_instagram = '[]'::jsonb,
    content_frequency = '{"youtube": 4, "instagram": 0}'::jsonb,
    content_quality_score = 8.5,
    previous_brand_deals = '[{"brand": "Samsung", "year": 2023, "type": "product review", "value": 5000}, {"brand": "Apple", "year": 2023, "type": "sponsored content", "value": 8000}]'::jsonb,
    industries_worked_with = '["technology", "consumer electronics", "mobile devices"]'::jsonb,
    products_advertised = '["smartphones", "laptops", "headphones", "cameras", "smart home devices"]'::jsonb,
    average_brand_deal_value = 5500.00,
    account_age_months = 62,
    activity_consistency_score = 9.2,
    peak_posting_hours = '[9, 10, 11, 19, 20, 21]'::jsonb,
    seasonal_trends = '{"peak_months": ["November", "December"], "low_months": ["July", "August"]}'::jsonb,
    audience_age_distribution = '{"18-24": 30, "25-34": 45, "35-44": 20, "45+": 5}'::jsonb,
    audience_gender_split = '{"male": 70, "female": 28, "other": 2}'::jsonb,
    audience_location_top_cities = '["San Francisco", "New York", "Toronto", "London", "Berlin"]'::jsonb,
    audience_interests = '["technology", "gadgets", "reviews", "smartphones", "gaming"]'::jsonb,
    average_likes_per_post = 2850,
    average_comments_per_post = 180,
    average_shares_per_post = 95,
    viral_content_count = 12,
    fake_follower_percentage = 2.5,
    brand_safety_score = 9.1,
    content_authenticity_score = 8.8,
    community_sentiment_score = 8.9,
    niche_authority_score = 9.3,
    expert_topics = '["consumer electronics", "mobile technology", "product reviews"]'::jsonb,
    collaboration_readiness = true
WHERE user_id = 'k1111111-1111-1111-1111-111111111111';

UPDATE kol_profiles SET 
    instagram_follower_count = 65000,
    youtube_subscriber_count = 85000,
    instagram_engagement_rate = 0.0680,
    youtube_engagement_rate = 0.0620,
    topics_covered_youtube = '["makeup tutorials", "skincare routines", "product reviews", "beauty hauls", "get ready with me"]'::jsonb,
    topics_covered_instagram = '["daily makeup", "skincare tips", "product swatches", "outfit coordination", "lifestyle moments"]'::jsonb,
    content_frequency = '{"youtube": 5, "instagram": 7}'::jsonb,
    content_quality_score = 8.8,
    previous_brand_deals = '[{"brand": "Sephora", "year": 2023, "type": "brand partnership", "value": 12000}, {"brand": "Fenty Beauty", "year": 2023, "type": "product launch", "value": 15000}]'::jsonb,
    industries_worked_with = '["beauty", "cosmetics", "skincare", "fashion"]'::jsonb,
    products_advertised = '["lipstick", "foundation", "skincare serums", "makeup palettes", "beauty tools"]'::jsonb,
    average_brand_deal_value = 11800.00,
    account_age_months = 48,
    activity_consistency_score = 8.9,
    peak_posting_hours = '[7, 8, 9, 18, 19, 20, 21]'::jsonb,
    seasonal_trends = '{"peak_months": ["October", "December", "February"], "low_months": ["August"]}'::jsonb,
    audience_age_distribution = '{"16-24": 40, "25-34": 35, "35-44": 20, "45+": 5}'::jsonb,
    audience_gender_split = '{"male": 15, "female": 83, "other": 2}'::jsonb,
    audience_location_top_cities = '["Los Angeles", "New York", "London", "Toronto", "Sydney"]'::jsonb,
    audience_interests = '["beauty", "makeup", "skincare", "fashion", "lifestyle"]'::jsonb,
    average_likes_per_post = 4200,
    average_comments_per_post = 320,
    average_shares_per_post = 180,
    viral_content_count = 8,
    fake_follower_percentage = 3.2,
    brand_safety_score = 8.7,
    content_authenticity_score = 9.1,
    community_sentiment_score = 9.0,
    niche_authority_score = 8.9,
    expert_topics = '["beauty tutorials", "skincare education", "product reviews"]'::jsonb,
    collaboration_readiness = true
WHERE user_id = 'k2222222-2222-2222-2222-222222222222';

UPDATE kol_profiles SET 
    instagram_follower_count = 0,
    youtube_subscriber_count = 220000,
    instagram_engagement_rate = 0.0000,
    youtube_engagement_rate = 0.0380,
    topics_covered_youtube = '["gaming walkthroughs", "game reviews", "esports highlights", "gaming tips", "live gameplay"]'::jsonb,
    topics_covered_instagram = '[]'::jsonb,
    content_frequency = '{"youtube": 7, "instagram": 0}'::jsonb,
    content_quality_score = 8.2,
    previous_brand_deals = '[{"brand": "Razer", "year": 2023, "type": "gaming gear sponsorship", "value": 10000}, {"brand": "NVIDIA", "year": 2023, "type": "GPU showcase", "value": 7500}]'::jsonb,
    industries_worked_with = '["gaming", "esports", "technology", "entertainment"]'::jsonb,
    products_advertised = '["gaming keyboards", "gaming mice", "headsets", "graphics cards", "gaming chairs"]'::jsonb,
    average_brand_deal_value = 7166.00,
    account_age_months = 72,
    activity_consistency_score = 9.5,
    peak_posting_hours = '[14, 15, 16, 17, 20, 21, 22, 23]'::jsonb,
    seasonal_trends = '{"peak_months": ["November", "December", "January"], "low_months": ["June", "July"]}'::jsonb,
    audience_age_distribution = '{"16-24": 50, "25-34": 35, "35-44": 12, "45+": 3}'::jsonb,
    audience_gender_split = '{"male": 80, "female": 18, "other": 2}'::jsonb,
    audience_location_top_cities = '["Los Angeles", "Berlin", "São Paulo", "Tokyo", "Seoul"]'::jsonb,
    audience_interests = '["gaming", "esports", "technology", "entertainment", "streaming"]'::jsonb,
    average_likes_per_post = 5800,
    average_comments_per_post = 420,
    average_shares_per_post = 290,
    viral_content_count = 15,
    fake_follower_percentage = 1.8,
    brand_safety_score = 8.9,
    content_authenticity_score = 8.5,
    community_sentiment_score = 8.7,
    niche_authority_score = 9.1,
    expert_topics = '["competitive gaming", "game strategy", "hardware reviews"]'::jsonb,
    collaboration_readiness = true
WHERE user_id = 'k3333333-3333-3333-3333-333333333333';

-- Insert KOL analytics
INSERT INTO kol_analytics (kol_id, platform, followers, engagement_rate, average_views, audience_demographics, top_content_categories) VALUES
('k1111111-1111-1111-1111-111111111111', 'youtube', 150000, 0.045, 25000, 
 '{"ageDistribution": {"18-24": 30, "25-34": 45, "35-44": 25}, "genderDistribution": {"male": 70, "female": 30}, "topLocations": ["US", "Canada", "UK"]}',
 '["technology", "reviews", "gadgets"]'),
('k2222222-2222-2222-2222-222222222222', 'youtube', 85000, 0.065, 15000,
 '{"ageDistribution": {"16-24": 40, "25-34": 35, "35-44": 25}, "genderDistribution": {"male": 15, "female": 85}, "topLocations": ["US", "UK", "Australia"]}',
 '["beauty", "fashion", "lifestyle"]'),
('k3333333-3333-3333-3333-333333333333', 'youtube', 220000, 0.038, 45000,
 '{"ageDistribution": {"16-24": 50, "25-34": 35, "35-44": 15}, "genderDistribution": {"male": 80, "female": 20}, "topLocations": ["US", "Germany", "Brazil"]}',
 '["gaming", "esports", "entertainment"]'),
('k4444444-4444-4444-4444-444444444444', 'youtube', 65000, 0.055, 12000,
 '{"ageDistribution": {"18-24": 35, "25-34": 40, "35-44": 25}, "genderDistribution": {"male": 25, "female": 75}, "topLocations": ["US", "Canada", "UK"]}',
 '["lifestyle", "wellness", "travel"]'),
('k5555555-5555-5555-5555-555555555555', 'youtube', 95000, 0.048, 18000,
 '{"ageDistribution": {"18-24": 25, "25-34": 45, "35-44": 30}, "genderDistribution": {"male": 55, "female": 45}, "topLocations": ["US", "Australia", "UK"]}',
 '["fitness", "health", "nutrition"]');

-- Insert sample campaigns
INSERT INTO campaigns (id, business_id, title, description, objectives, requirements, budget, timeline, status) VALUES
('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'New Smartphone Launch', 'Promote our latest flagship smartphone',
 '[{"type": "awareness", "target": 500000, "metric": "impressions"}, {"type": "engagement", "target": 25000, "metric": "likes"}]',
 '{"platforms": ["youtube"], "categories": ["technology", "reviews"], "minFollowers": 50000, "maxFollowers": 500000, "targetDemographics": {"ageRange": ["18-34"], "interests": ["technology", "gadgets"]}}',
 '{"total": 15000, "perKOL": 3000, "currency": "USD"}',
 '{"startDate": "2024-03-01", "endDate": "2024-03-31", "applicationDeadline": "2024-02-20"}',
 'active'),
('c2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'Spring Fashion Collection', 'Showcase our new spring fashion line',
 '[{"type": "awareness", "target": 200000, "metric": "impressions"}, {"type": "conversion", "target": 500, "metric": "sales"}]',
 '{"platforms": ["youtube", "instagram"], "categories": ["fashion", "lifestyle"], "minFollowers": 20000, "maxFollowers": 200000, "targetDemographics": {"ageRange": ["18-34"], "gender": ["female"], "interests": ["fashion", "lifestyle"]}}',
 '{"total": 8000, "perKOL": 2000, "currency": "USD"}',
 '{"startDate": "2024-02-15", "endDate": "2024-03-15", "applicationDeadline": "2024-02-10"}',
 'active');

-- Insert campaign-KOL relationships
INSERT INTO campaign_kols (campaign_id, kol_id, status, proposed_rate, agreed_rate) VALUES
('c1111111-1111-1111-1111-111111111111', 'k1111111-1111-1111-1111-111111111111', 'accepted', 3000, 3000),
('c1111111-1111-1111-1111-111111111111', 'k3333333-3333-3333-3333-333333333333', 'applied', 3500, null),
('c2222222-2222-2222-2222-222222222222', 'k2222222-2222-2222-2222-222222222222', 'accepted', 2000, 1800),
('c2222222-2222-2222-2222-222222222222', 'k4444444-4444-4444-4444-444444444444', 'invited', null, null);
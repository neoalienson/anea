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
-- KOL Matching Platform Database Schema

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('business', 'kol', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business profiles
CREATE TABLE business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    company_size VARCHAR(20) CHECK (company_size IN ('small', 'medium', 'large')),
    website VARCHAR(255),
    description TEXT,
    target_audience JSONB,
    budget_range JSONB,
    verification_documents JSONB,
    
    -- Enhanced SMB Business Intelligence Signals
    -- Company Information
    legal_business_name VARCHAR(500),
    business_registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    founded_year INTEGER,
    business_type VARCHAR(50), -- LLC, Corporation, Partnership, etc.
    
    -- Financial Metrics
    annual_revenue DECIMAL(15,2),
    revenue_growth_rate DECIMAL(5,2), -- percentage
    profit_margin DECIMAL(5,2), -- percentage
    employee_count INTEGER,
    employee_growth_rate DECIMAL(5,2), -- percentage
    funding_raised DECIMAL(15,2),
    funding_stage VARCHAR(50), -- seed, series-a, etc.
    stock_ticker VARCHAR(10),
    market_cap DECIMAL(15,2),
    
    -- Geographic Presence
    headquarters_address JSONB, -- {street, city, state, country, zipcode}
    operating_countries JSONB DEFAULT '[]'::jsonb, -- array of country codes
    office_locations JSONB DEFAULT '[]'::jsonb, -- array of office details
    franchise_count INTEGER DEFAULT 0,
    retail_locations INTEGER DEFAULT 0,
    
    -- Industry & Market Position
    primary_industry VARCHAR(100),
    secondary_industries JSONB DEFAULT '[]'::jsonb,
    industry_rank INTEGER, -- ranking in industry
    market_share_percentage DECIMAL(5,2),
    key_competitors JSONB DEFAULT '[]'::jsonb,
    
    -- Products & Services
    primary_products JSONB DEFAULT '[]'::jsonb,
    secondary_products JSONB DEFAULT '[]'::jsonb,
    service_categories JSONB DEFAULT '[]'::jsonb,
    product_portfolio_size INTEGER DEFAULT 0,
    
    -- Online Presence & Digital Footprint
    linkedin_company_url VARCHAR(500),
    linkedin_followers INTEGER DEFAULT 0,
    linkedin_engagement_rate DECIMAL(5,4) DEFAULT 0,
    google_maps_rating DECIMAL(3,2) DEFAULT 0,
    google_maps_review_count INTEGER DEFAULT 0,
    website_traffic_rank INTEGER,
    website_monthly_visitors INTEGER,
    domain_authority INTEGER DEFAULT 0,
    
    -- Social Media Presence
    social_media_presence JSONB DEFAULT '{}'::jsonb, -- platform-specific metrics
    brand_mention_sentiment DECIMAL(3,2) DEFAULT 0, -- -1 to 1 scale
    online_reputation_score DECIMAL(3,2) DEFAULT 0, -- 0-10 scale
    
    -- Business Operations
    business_model VARCHAR(100), -- B2B, B2C, B2B2C, etc.
    revenue_streams JSONB DEFAULT '[]'::jsonb,
    target_market_segments JSONB DEFAULT '[]'::jsonb,
    seasonal_business_patterns JSONB DEFAULT '{}'::jsonb,
    
    -- Certifications & Compliance
    industry_certifications JSONB DEFAULT '[]'::jsonb,
    compliance_standards JSONB DEFAULT '[]'::jsonb,
    quality_ratings JSONB DEFAULT '{}'::jsonb,
    
    -- Technology & Innovation
    technology_stack JSONB DEFAULT '[]'::jsonb,
    digital_transformation_score DECIMAL(3,2) DEFAULT 0,
    innovation_index DECIMAL(3,2) DEFAULT 0,
    
    -- Partnership & Network
    key_partnerships JSONB DEFAULT '[]'::jsonb,
    supplier_network_size INTEGER DEFAULT 0,
    customer_segments JSONB DEFAULT '[]'::jsonb,
    
    -- Risk & Stability Metrics
    financial_stability_score DECIMAL(3,2) DEFAULT 0, -- 0-10 scale
    credit_rating VARCHAR(10),
    business_risk_score DECIMAL(3,2) DEFAULT 0, -- 0-10 scale
    
    -- Marketing & Advertising Intelligence
    advertising_spend_annual DECIMAL(12,2),
    marketing_channels JSONB DEFAULT '[]'::jsonb,
    brand_awareness_score DECIMAL(3,2) DEFAULT 0,
    customer_acquisition_cost DECIMAL(10,2),
    customer_lifetime_value DECIMAL(10,2),
    
    -- ESG & Sustainability
    sustainability_rating DECIMAL(3,2) DEFAULT 0,
    environmental_certifications JSONB DEFAULT '[]'::jsonb,
    social_responsibility_score DECIMAL(3,2) DEFAULT 0,
    governance_score DECIMAL(3,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KOL profiles
CREATE TABLE kol_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar VARCHAR(255),
    categories JSONB,
    social_links JSONB,
    audience_metrics JSONB,
    content_style JSONB,
    verification_status VARCHAR(20) DEFAULT 'pending',
    
    -- Enhanced KOL Signals
    -- Platform Metrics
    instagram_follower_count INTEGER DEFAULT 0,
    youtube_subscriber_count INTEGER DEFAULT 0,
    instagram_engagement_rate DECIMAL(5,4) DEFAULT 0,
    youtube_engagement_rate DECIMAL(5,4) DEFAULT 0,
    
    -- Content Analysis
    topics_covered_youtube JSONB DEFAULT '[]'::jsonb,
    topics_covered_instagram JSONB DEFAULT '[]'::jsonb,
    content_frequency JSONB DEFAULT '{}'::jsonb, -- posts per week/month
    content_quality_score DECIMAL(3,2) DEFAULT 0, -- 0-10 scale
    
    -- Brand Collaboration History
    previous_brand_deals JSONB DEFAULT '[]'::jsonb,
    industries_worked_with JSONB DEFAULT '[]'::jsonb,
    products_advertised JSONB DEFAULT '[]'::jsonb,
    average_brand_deal_value DECIMAL(10,2),
    
    -- Activity & Experience
    account_age_months INTEGER DEFAULT 0,
    activity_consistency_score DECIMAL(3,2) DEFAULT 0, -- 0-10 scale
    peak_posting_hours JSONB DEFAULT '[]'::jsonb,
    seasonal_trends JSONB DEFAULT '{}'::jsonb,
    
    -- Audience Insights
    audience_age_distribution JSONB DEFAULT '{}'::jsonb,
    audience_gender_split JSONB DEFAULT '{}'::jsonb,
    audience_location_top_cities JSONB DEFAULT '[]'::jsonb,
    audience_interests JSONB DEFAULT '[]'::jsonb,
    
    -- Performance Metrics
    average_likes_per_post INTEGER DEFAULT 0,
    average_comments_per_post INTEGER DEFAULT 0,
    average_shares_per_post INTEGER DEFAULT 0,
    viral_content_count INTEGER DEFAULT 0,
    
    -- Authenticity & Trust Signals
    fake_follower_percentage DECIMAL(5,2) DEFAULT 0,
    brand_safety_score DECIMAL(3,2) DEFAULT 0, -- 0-10 scale
    content_authenticity_score DECIMAL(3,2) DEFAULT 0, -- 0-10 scale
    community_sentiment_score DECIMAL(3,2) DEFAULT 0, -- 0-10 scale
    
    -- Niche Expertise
    niche_authority_score DECIMAL(3,2) DEFAULT 0, -- 0-10 scale
    expert_topics JSONB DEFAULT '[]'::jsonb,
    collaboration_readiness BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    objectives JSONB,
    requirements JSONB,
    budget JSONB,
    timeline JSONB,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    deliverables JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign-KOL relationships
CREATE TABLE campaign_kols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    kol_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'invited' CHECK (status IN ('invited', 'applied', 'accepted', 'declined', 'completed')),
    proposed_rate DECIMAL(10,2),
    agreed_rate DECIMAL(10,2),
    deliverables JSONB,
    performance JSONB,
    feedback JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KOL Analytics
CREATE TABLE kol_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kol_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50),
    followers INTEGER,
    engagement_rate DECIMAL(5,4),
    average_views INTEGER,
    audience_demographics JSONB,
    top_content_categories JSONB,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(kol_id, platform)
);

-- Campaign Performance
CREATE TABLE campaign_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    kol_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reach INTEGER,
    impressions INTEGER,
    engagement INTEGER,
    conversions INTEGER,
    roi DECIMAL(10,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_kol_profiles_user_id ON kol_profiles(user_id);
CREATE INDEX idx_campaigns_business_id ON campaigns(business_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaign_kols_campaign_id ON campaign_kols(campaign_id);
CREATE INDEX idx_campaign_kols_kol_id ON campaign_kols(kol_id);
CREATE INDEX idx_kol_analytics_kol_id ON kol_analytics(kol_id);
CREATE INDEX idx_kol_analytics_platform ON kol_analytics(platform);
CREATE INDEX idx_kol_profiles_verification ON kol_profiles(verification_status);
CREATE INDEX idx_kol_profiles_categories ON kol_profiles USING GIN(categories);
CREATE INDEX idx_campaign_performance_campaign_id ON campaign_performance(campaign_id);
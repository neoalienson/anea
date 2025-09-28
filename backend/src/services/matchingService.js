/**
 * KOL Matching Service - 3 Strategies for MVP
 * 1. Industry/Category Matching
 * 2. Audience Size & Budget Matching  
 * 3. Engagement Quality Matching (Simulated AI)
 */

const { supabase } = require('../config/supabase');

class MatchingService {
  
  /**
   * Strategy 1: Industry/Category Matching
   * Match KOLs based on their content categories with business industry
   */
  async industryMatching(campaign, options = {}) {
    try {
      const { limit = 10 } = options;
      
      // Get campaign requirements
      const campaignIndustry = campaign.requirements?.industry || campaign.objectives?.industry;
      const campaignCategories = campaign.requirements?.categories || [];
      
      if (!campaignIndustry && campaignCategories.length === 0) {
        return { matches: [], strategy: 'industry', confidence: 0 };
      }

      // Find KOLs with matching categories
      const { data: kolProfiles, error } = await supabase
        .from('kol_profiles')
        .select(`
          *,
          users!inner(id, email, role, is_active),
          kol_analytics(*)
        `)
        .eq('users.role', 'kol')
        .eq('users.is_active', true)
        .limit(limit * 2); // Get more to filter and rank

      if (error) {
        console.error('Industry matching error:', error);
        return { matches: [], strategy: 'industry', confidence: 0 };
      }

      // Score and rank matches
      const scoredMatches = kolProfiles
        .map(kol => {
          const categories = kol.categories || [];
          let score = 0;

          // Direct industry match (high score)
          if (campaignIndustry) {
            if (categories.includes(campaignIndustry.toLowerCase())) {
              score += 50;
            }
          }

          // Category overlap scoring
          campaignCategories.forEach(category => {
            if (categories.includes(category.toLowerCase())) {
              score += 30;
            }
          });

          // Partial category matching (fuzzy matching)
          categories.forEach(kolCategory => {
            campaignCategories.forEach(campaignCategory => {
              if (kolCategory.includes(campaignCategory.toLowerCase()) || 
                  campaignCategory.toLowerCase().includes(kolCategory)) {
                score += 15;
              }
            });
          });

          return {
            ...kol,
            matchScore: score,
            matchReasons: this.getIndustryMatchReasons(kol, campaignIndustry, campaignCategories)
          };
        })
        .filter(kol => kol.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

      return {
        matches: scoredMatches,
        strategy: 'industry',
        confidence: scoredMatches.length > 0 ? Math.min(85, scoredMatches[0]?.matchScore || 0) : 0
      };

    } catch (error) {
      console.error('Industry matching service error:', error);
      return { matches: [], strategy: 'industry', confidence: 0 };
    }
  }

  /**
   * Strategy 2: Audience Size & Budget Matching
   * Match based on KOL's audience size fitting the campaign budget
   */
  async audienceBudgetMatching(campaign, options = {}) {
    try {
      const { limit = 10 } = options;
      
      const budget = campaign.budget || {};
      const minBudget = budget.min || 0;
      const maxBudget = budget.max || 999999;
      
      // Get KOLs with analytics data
      const { data: kolsWithAnalytics, error } = await supabase
        .from('kol_profiles')
        .select(`
          *,
          users!inner(id, email, role, is_active),
          kol_analytics(*)
        `)
        .eq('users.role', 'kol')
        .eq('users.is_active', true)
        .not('kol_analytics', 'is', null)
        .limit(limit * 2);

      if (error) {
        console.error('Audience budget matching error:', error);
        return { matches: [], strategy: 'audience_budget', confidence: 0 };
      }

      // Score based on audience size and estimated rates
      const scoredMatches = kolsWithAnalytics
        .map(kol => {
          const analytics = kol.kol_analytics[0] || {};
          const followers = analytics.followers || 0;
          const engagementRate = analytics.engagement_rate || 0;
          
          // Estimate KOL rate based on followers (HK market rates)
          const estimatedRate = this.estimateKOLRate(followers, engagementRate);
          
          let score = 0;
          
          // Budget fit scoring
          if (estimatedRate >= minBudget && estimatedRate <= maxBudget) {
            score += 40; // Perfect budget fit
          } else if (estimatedRate < maxBudget * 1.2) {
            score += 25; // Close budget fit
          }
          
          // Audience size scoring (more followers = higher score, but with diminishing returns)
          if (followers > 100000) score += 30;
          else if (followers > 50000) score += 25;
          else if (followers > 10000) score += 20;
          else if (followers > 1000) score += 10;
          
          // Engagement quality bonus
          if (engagementRate > 0.05) score += 20; // 5%+ engagement
          else if (engagementRate > 0.03) score += 15; // 3%+ engagement
          else if (engagementRate > 0.02) score += 10; // 2%+ engagement

          return {
            ...kol,
            matchScore: score,
            estimatedRate,
            matchReasons: this.getBudgetMatchReasons(kol, estimatedRate, minBudget, maxBudget, analytics)
          };
        })
        .filter(kol => kol.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

      return {
        matches: scoredMatches,
        strategy: 'audience_budget',
        confidence: scoredMatches.length > 0 ? Math.min(90, scoredMatches[0]?.matchScore || 0) : 0
      };

    } catch (error) {
      console.error('Audience budget matching service error:', error);
      return { matches: [], strategy: 'audience_budget', confidence: 0 };
    }
  }

  /**
   * Strategy 3: Engagement Quality Matching (Simulated AI)
   * Advanced scoring based on engagement patterns, audience demographics, and content quality
   */
  async engagementQualityMatching(campaign, options = {}) {
    try {
      const { limit = 10 } = options;
      
      // Get all active KOLs with full data
      const { data: kolsWithData, error } = await supabase
        .from('kol_profiles')
        .select(`
          *,
          users!inner(id, email, role, is_active),
          kol_analytics(*),
          campaign_kols(
            campaign_id,
            status,
            performance,
            campaigns(*)
          )
        `)
        .eq('users.role', 'kol')
        .eq('users.is_active', true)
        .limit(limit * 3);

      if (error) {
        console.error('Engagement quality matching error:', error);
        return { matches: [], strategy: 'engagement_quality', confidence: 0 };
      }

      // Advanced AI-like scoring algorithm
      const scoredMatches = kolsWithData
        .map(kol => {
          const analytics = kol.kol_analytics[0] || {};
          const pastCampaigns = kol.campaign_kols || [];
          
          let score = 0;
          
          // Engagement Quality Score (40 points max)
          const engagementRate = analytics.engagement_rate || 0;
          const followers = analytics.followers || 0;
          const avgViews = analytics.average_views || 0;
          
          // Quality engagement (not just quantity)
          const engagementScore = this.calculateEngagementQuality(engagementRate, followers, avgViews);
          score += engagementScore;
          
          // Historical Performance Score (30 points max)
          const performanceScore = this.calculateHistoricalPerformance(pastCampaigns);
          score += performanceScore;
          
          // Content Consistency Score (20 points max)
          const consistencyScore = this.calculateContentConsistency(kol, analytics);
          score += consistencyScore;
          
          // Audience Demographics Alignment (10 points max)
          const audienceScore = this.calculateAudienceAlignment(campaign, analytics);
          score += audienceScore;

          return {
            ...kol,
            matchScore: score,
            matchReasons: this.getEngagementMatchReasons(kol, analytics, pastCampaigns, campaign)
          };
        })
        .filter(kol => kol.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

      return {
        matches: scoredMatches,
        strategy: 'engagement_quality',
        confidence: scoredMatches.length > 0 ? Math.min(95, scoredMatches[0]?.matchScore || 0) : 0
      };

    } catch (error) {
      console.error('Engagement quality matching service error:', error);
      return { matches: [], strategy: 'engagement_quality', confidence: 0 };
    }
  }

  /**
   * Combined Matching Strategy
   * Runs all 3 strategies and combines results with weighted scoring
   */
  async combinedMatching(campaign, options = {}) {
    try {
      const { limit = 10 } = options;
      
      // Run all strategies in parallel
      const [industryResult, budgetResult, engagementResult] = await Promise.all([
        this.industryMatching(campaign, { limit: limit * 2 }),
        this.audienceBudgetMatching(campaign, { limit: limit * 2 }),
        this.engagementQualityMatching(campaign, { limit: limit * 2 })
      ]);

      // Combine and deduplicate results
      const combinedMatches = new Map();
      
      // Weight strategies: Industry (30%), Budget (35%), Engagement (35%)
      const strategies = [
        { result: industryResult, weight: 0.3 },
        { result: budgetResult, weight: 0.35 },
        { result: engagementResult, weight: 0.35 }
      ];

      strategies.forEach(({ result, weight }) => {
        result.matches.forEach(kol => {
          const kolId = kol.user_id;
          const weightedScore = kol.matchScore * weight;
          
          if (combinedMatches.has(kolId)) {
            const existing = combinedMatches.get(kolId);
            existing.combinedScore += weightedScore;
            existing.strategies.push(result.strategy);
            existing.matchReasons = [...existing.matchReasons, ...kol.matchReasons];
          } else {
            combinedMatches.set(kolId, {
              ...kol,
              combinedScore: weightedScore,
              strategies: [result.strategy],
              originalScore: kol.matchScore
            });
          }
        });
      });

      // Sort by combined score and return top matches
      const finalMatches = Array.from(combinedMatches.values())
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .slice(0, limit);

      return {
        matches: finalMatches,
        strategy: 'combined',
        confidence: finalMatches.length > 0 ? Math.min(95, finalMatches[0]?.combinedScore || 0) : 0,
        strategyBreakdown: {
          industry: industryResult,
          budget: budgetResult,
          engagement: engagementResult
        }
      };

    } catch (error) {
      console.error('Combined matching service error:', error);
      return { matches: [], strategy: 'combined', confidence: 0 };
    }
  }

  // Helper methods for scoring

  estimateKOLRate(followers, engagementRate) {
    // Hong Kong market rates (approximate)
    const baseRate = followers * 0.1; // HK$0.1 per follower
    const engagementMultiplier = Math.max(0.5, engagementRate * 20); // Engagement bonus
    return Math.round(baseRate * engagementMultiplier);
  }

  calculateEngagementQuality(engagementRate, followers, avgViews) {
    let score = 0;
    
    // High engagement rate
    if (engagementRate > 0.08) score += 40;
    else if (engagementRate > 0.05) score += 30;
    else if (engagementRate > 0.03) score += 20;
    else if (engagementRate > 0.02) score += 10;
    
    // Views to followers ratio
    const viewRatio = avgViews / Math.max(followers, 1);
    if (viewRatio > 0.3) score += 10;
    else if (viewRatio > 0.2) score += 5;
    
    return Math.min(40, score);
  }

  calculateHistoricalPerformance(pastCampaigns) {
    if (pastCampaigns.length === 0) return 5; // Neutral score for new KOLs
    
    let score = 0;
    let successCount = 0;
    
    pastCampaigns.forEach(campaign => {
      if (campaign.status === 'completed') {
        successCount++;
        const performance = campaign.performance || {};
        const roi = performance.roi || 0;
        if (roi > 200) score += 10;
        else if (roi > 150) score += 7;
        else if (roi > 100) score += 5;
      }
    });
    
    // Success rate bonus
    const successRate = successCount / pastCampaigns.length;
    score += successRate * 20;
    
    return Math.min(30, score);
  }

  calculateContentConsistency(kol, analytics) {
    let score = 0;
    
    // Has categories defined
    if (kol.categories && kol.categories.length > 0) score += 10;
    
    // Has regular posting (simulated)
    if (analytics.last_updated) {
      const daysSinceUpdate = (Date.now() - new Date(analytics.last_updated)) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 7) score += 10;
      else if (daysSinceUpdate < 14) score += 5;
    }
    
    return Math.min(20, score);
  }

  calculateAudienceAlignment(campaign, analytics) {
    let score = 0;
    
    // Audience demographics matching (simulated)
    const demographics = analytics.audience_demographics || {};
    const campaignTarget = campaign.requirements?.target_audience || {};
    
    // Age group alignment
    if (demographics.age_groups && campaignTarget.age_groups) {
      const overlap = demographics.age_groups.filter(age => 
        campaignTarget.age_groups.includes(age)
      );
      score += overlap.length * 2;
    }
    
    // Location alignment
    if (demographics.location && campaignTarget.location) {
      if (demographics.location === campaignTarget.location) score += 5;
    }
    
    return Math.min(10, score);
  }

  // Match reasons generators

  getIndustryMatchReasons(kol, industry, categories) {
    const reasons = [];
    
    if (industry && kol.categories?.includes(industry.toLowerCase())) {
      reasons.push(`Perfect industry match: ${industry}`);
    }
    
    categories.forEach(category => {
      if (kol.categories?.includes(category.toLowerCase())) {
        reasons.push(`Category expertise: ${category}`);
      }
    });
    
    if (reasons.length === 0) {
      reasons.push('Related content categories found');
    }
    
    return reasons;
  }

  getBudgetMatchReasons(kol, estimatedRate, minBudget, maxBudget, analytics) {
    const reasons = [];
    
    if (estimatedRate >= minBudget && estimatedRate <= maxBudget) {
      reasons.push(`Perfect budget fit: HK$${estimatedRate.toLocaleString()}`);
    } else if (estimatedRate < maxBudget * 1.2) {
      reasons.push(`Close budget match: HK$${estimatedRate.toLocaleString()}`);
    }
    
    const followers = analytics.followers || 0;
    if (followers > 50000) {
      reasons.push(`Strong reach: ${followers.toLocaleString()} followers`);
    }
    
    const engagementRate = analytics.engagement_rate || 0;
    if (engagementRate > 0.03) {
      reasons.push(`Good engagement: ${(engagementRate * 100).toFixed(1)}%`);
    }
    
    return reasons;
  }

  getEngagementMatchReasons(kol, analytics, pastCampaigns, campaign) {
    const reasons = [];
    
    const engagementRate = analytics.engagement_rate || 0;
    if (engagementRate > 0.05) {
      reasons.push(`Excellent engagement: ${(engagementRate * 100).toFixed(1)}%`);
    }
    
    const successfulCampaigns = pastCampaigns.filter(c => c.status === 'completed').length;
    if (successfulCampaigns > 0) {
      reasons.push(`Proven track record: ${successfulCampaigns} successful campaigns`);
    }
    
    if (kol.categories && kol.categories.length > 0) {
      reasons.push('Consistent content categories');
    }
    
    if (analytics.audience_demographics) {
      reasons.push('Good audience demographics data');
    }
    
    return reasons;
  }
}

module.exports = new MatchingService();
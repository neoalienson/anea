class MatchingService {
  calculateAudienceMatch(businessAudience, kolAudience) {
    if (!businessAudience || !kolAudience) return 0;

    let score = 0;
    let factors = 0;

    // Age range matching
    if (businessAudience.ageRanges && kolAudience.ageDistribution) {
      const overlap = this.calculateAgeOverlap(businessAudience.ageRanges, kolAudience.ageDistribution);
      score += overlap * 0.4;
      factors++;
    }

    // Interest matching
    if (businessAudience.interests && kolAudience.topInterests) {
      const overlap = this.calculateInterestOverlap(businessAudience.interests, kolAudience.topInterests);
      score += overlap * 0.6;
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  calculateContentRelevance(businessCategories, kolCategories) {
    if (!businessCategories || !kolCategories || businessCategories.length === 0) return 0;

    const matches = businessCategories.filter(cat => 
      kolCategories.some(kolCat => kolCat.toLowerCase().includes(cat.toLowerCase()))
    );

    return matches.length / businessCategories.length;
  }

  calculateEngagementQuality(engagementRate) {
    // Normalize engagement rate (0.02-0.1 is good range)
    if (engagementRate >= 0.05) return 1;
    if (engagementRate >= 0.02) return engagementRate / 0.05;
    return engagementRate / 0.02 * 0.5;
  }

  calculateHistoricalPerformance(kolId) {
    // Placeholder - would use actual campaign history
    return 0.7;
  }

  calculateKOLSuitabilityScore(business, kol) {
    const audienceMatch = this.calculateAudienceMatch(business.targetAudience, kol.audienceMetrics?.demographics);
    const contentRelevance = this.calculateContentRelevance(business.categories || [], kol.categories || []);
    const engagementQuality = this.calculateEngagementQuality(kol.engagementRate || 0);
    const historicalPerformance = this.calculateHistoricalPerformance(kol.id);

    return (
      audienceMatch * 0.4 +
      contentRelevance * 0.3 +
      engagementQuality * 0.2 +
      historicalPerformance * 0.1
    );
  }

  calculateAgeOverlap(businessAges, kolAgeDistribution) {
    let overlap = 0;
    businessAges.forEach(range => {
      if (kolAgeDistribution[range]) {
        overlap += kolAgeDistribution[range] / 100;
      }
    });
    return Math.min(overlap, 1);
  }

  calculateInterestOverlap(businessInterests, kolInterests) {
    const matches = businessInterests.filter(interest =>
      kolInterests.some(kolInterest => 
        kolInterest.toLowerCase().includes(interest.toLowerCase())
      )
    );
    return matches.length / businessInterests.length;
  }
}

module.exports = new MatchingService();
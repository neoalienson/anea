const matchingService = require('../src/services/matchingService');

describe('Matching Service', () => {
  describe('calculateAudienceMatch', () => {
    it('should calculate audience overlap correctly', () => {
      const businessAudience = {
        ageRanges: ['18-24', '25-34'],
        interests: ['technology', 'gadgets']
      };

      const kolAudience = {
        ageDistribution: { '18-24': 40, '25-34': 35, '35-44': 25 },
        topInterests: ['technology', 'reviews', 'gadgets']
      };

      const score = matchingService.calculateAudienceMatch(businessAudience, kolAudience);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should return 0 for no audience data', () => {
      const score = matchingService.calculateAudienceMatch(null, null);
      expect(score).toBe(0);
    });
  });

  describe('calculateContentRelevance', () => {
    it('should calculate content relevance correctly', () => {
      const businessCategories = ['technology', 'gadgets'];
      const kolCategories = ['technology', 'reviews', 'unboxing'];

      const score = matchingService.calculateContentRelevance(businessCategories, kolCategories);
      expect(score).toBe(0.5); // 1 out of 2 categories match
    });

    it('should return 0 for no categories', () => {
      const score = matchingService.calculateContentRelevance([], []);
      expect(score).toBe(0);
    });
  });

  describe('calculateEngagementQuality', () => {
    it('should normalize engagement rate correctly', () => {
      expect(matchingService.calculateEngagementQuality(0.05)).toBe(1);
      expect(matchingService.calculateEngagementQuality(0.025)).toBe(0.5);
      expect(matchingService.calculateEngagementQuality(0.01)).toBe(0.25);
    });
  });

  describe('calculateKOLSuitabilityScore', () => {
    it('should calculate overall suitability score', () => {
      const business = {
        targetAudience: {
          ageRanges: ['18-24', '25-34'],
          interests: ['technology']
        },
        categories: ['technology']
      };

      const kol = {
        id: 'test-kol',
        categories: ['technology', 'reviews'],
        audienceMetrics: {
          demographics: {
            ageDistribution: { '18-24': 50, '25-34': 30 },
            topInterests: ['technology', 'gadgets']
          }
        },
        engagementRate: 0.04
      };

      const score = matchingService.calculateKOLSuitabilityScore(business, kol);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });
});
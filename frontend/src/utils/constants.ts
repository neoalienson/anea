export const API_BASE_URL = 'http://localhost:8000/api';

export const ROLES = {
  BUSINESS: 'business',
  KOL: 'kol',
  ADMIN: 'admin'
} as const;

export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const;

export const PLATFORMS = [
  'youtube',
  'instagram',
  'tiktok',
  'twitter',
  'linkedin'
] as const;

export const CATEGORIES = [
  'technology',
  'beauty',
  'gaming',
  'lifestyle',
  'fitness',
  'fashion',
  'food',
  'travel',
  'education',
  'entertainment'
] as const;

export const COMPANY_SIZES = [
  { value: 'small', label: 'Small (1-50)' },
  { value: 'medium', label: 'Medium (51-200)' },
  { value: 'large', label: 'Large (200+)' }
] as const;

export const INDUSTRIES = [
  'technology',
  'fashion',
  'beauty',
  'gaming',
  'lifestyle',
  'fitness',
  'food',
  'travel',
  'education',
  'entertainment',
  'finance',
  'healthcare'
] as const;
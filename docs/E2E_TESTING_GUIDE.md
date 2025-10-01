# E2E Testing Guide

This guide covers the end-to-end testing setup and execution for the KOL Matching Platform using both Cypress and Playwright testing frameworks.

## Overview

The E2E testing suite validates complete user journeys for both Business and KOL users, ensuring the platform works correctly from a user's perspective. We use two testing frameworks:
- **Cypress** - Primary E2E testing framework with superior developer experience and debugging
- **Playwright** - Secondary framework for cross-browser testing and CI/CD

## Setup

### Prerequisites
- Node.js 18+
- Frontend server running on http://localhost:3000
- Backend server running on http://localhost:8000
- Test data populated in Supabase database

### Installation
```bash
cd frontend-nextjs
npm install @playwright/test cypress --save-dev
```

### Configuration

#### Playwright Configuration (`playwright.config.ts`)
- Base URL: http://localhost:3000
- Browser: Chromium (Desktop Chrome)
- Screenshots: On failure only
- Retries: 2 in CI, 0 locally
- Auto-starts dev server if not running

#### Cypress Configuration (`cypress.config.ts`)
- Base URL: http://localhost:3000
- Viewport: 1280x720
- Screenshots enabled on failure
- Video recording disabled for faster execution

## Test Structure

### Playwright Tests (Primary)
- `tests/business-user-journey.spec.ts` - Complete business user workflow
- `tests/kol-user-journey.spec.ts` - Complete KOL user workflow
- `tests/business-user-simple.spec.ts` - Simplified business flow
- `tests/simple-test.spec.ts` - Basic functionality test

### Cypress Tests (Alternative)
- `cypress/e2e/business-user-journey.cy.ts` - Complete business user workflow
- `cypress/e2e/kol-user-journey.cy.ts` - Complete KOL user workflow

### Test Data
- **Business Users**: 
  - techcorp@example.com / password123 (TechCorp Solutions)
  - fashionbrand@example.com / password123 (Fashion Forward)
- **KOL Users**: 
  - techreviewer@example.com / password123 (Tech Reviewer Pro)
  - beautyguru@example.com / password123 (Beauty Guru Maya)
  - gamingpro@example.com / password123 (Gaming Pro)

## Running Tests

### Cypress Tests (Recommended)
```bash
# Run all tests headless
npm run test:e2e

# Interactive mode for debugging
npm run test:e2e:open

# Run in headed mode (visible browser)
npm run test:e2e:headed
```

### Playwright Tests
```bash
# Run Playwright tests
npm run test:playwright

# Playwright UI mode
npx playwright test --ui
```

## Test Coverage

### Business User Journey (11 Steps)
1. **Landing Page** - Platform introduction and navigation
2. **Authentication** - Secure login with business credentials
3. **Business Dashboard** - Overview with metrics and quick actions
4. **Campaign Management** - View existing campaigns and status
5. **Campaign Creation** - Create new marketing campaign with form validation
6. **Campaign Confirmation** - Verify successful creation and data persistence
7. **KOL Discovery** - AI-powered search and filtering system
8. **Search Functionality** - Filter KOLs by category, followers, engagement
9. **KOL Profile Viewing** - Detailed creator evaluation (if available)
10. **Dashboard Navigation** - Return to main business dashboard
11. **Secure Logout** - Session termination and redirect

### KOL User Journey (10 Steps)
1. **Landing Page** - Platform entry point with value proposition
2. **Authentication** - KOL login with creator credentials
3. **Creator Dashboard** - Content creator specific overview and metrics
4. **Profile Management** - Access comprehensive profile editor
5. **Profile Updates** - Update personal information, social links, bio
6. **YouTube Integration** - Load real-time channel metrics and analytics
7. **Campaign Discovery** - Browse available brand collaboration opportunities
8. **Application Management** - View and manage campaign applications
9. **Dashboard Return** - Navigate back to main creator dashboard
10. **Secure Logout** - Session completion and security

## Screenshot Documentation

Screenshots are automatically captured at key journey points:
- Stored in `cypress/screenshots/`
- Named with descriptive identifiers
- Used in user journey documentation
- Provide visual validation of UI state

## Test Data Attributes

Key elements have `data-testid` attributes for reliable selection:
- `nav-campaigns` - Campaign navigation
- `nav-discover` - Discover navigation  
- `nav-profile` - Profile navigation
- `user-menu` - User dropdown menu
- Form fields have `name` attributes

## Best Practices

### Test Writing
1. **Descriptive Names** - Clear test and step descriptions
2. **Stable Selectors** - Use data-testid over CSS selectors
3. **Wait Strategies** - Proper waits for async operations
4. **Screenshot Points** - Capture key user journey moments

### Maintenance
1. **Regular Updates** - Keep tests current with UI changes
2. **Data Management** - Ensure test data consistency
3. **Environment Sync** - Match test and dev environments
4. **Performance** - Optimize test execution time

## Troubleshooting

### Common Issues
1. **Element Not Found** - Check selector accuracy
2. **Timing Issues** - Add appropriate waits
3. **Authentication Failures** - Verify test credentials
4. **Screenshot Failures** - Check file permissions

### Debug Strategies
1. **Interactive Mode** - Use cypress:open for debugging
2. **Console Logs** - Add cy.log() for debugging
3. **Network Tab** - Monitor API calls
4. **Element Inspector** - Verify selectors

## CI/CD Integration

### Pipeline Configuration
```yaml
test-e2e:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm install
    - name: Start servers
      run: npm run dev &
    - name: Run E2E tests
      run: npm run cypress:run
```

### Artifacts
- Screenshots saved on test failures
- Test results exported for reporting
- Performance metrics collected

## Reporting

### Test Results
- Pass/fail status for each journey
- Execution time metrics
- Screenshot evidence
- Error details for failures

### User Journey Validation
- Complete workflow verification
- UI consistency checks
- Cross-browser compatibility
- Performance benchmarks

## Future Enhancements

### Planned Improvements
1. **Visual Regression Testing** - UI change detection
2. **Performance Testing** - Load time validation
3. **Accessibility Testing** - WCAG compliance
4. **Mobile Testing** - Responsive design validation

### Additional Test Scenarios
1. **Error Handling** - Invalid input validation
2. **Edge Cases** - Boundary condition testing
3. **Integration Points** - API interaction validation
4. **Security Testing** - Authentication and authorization
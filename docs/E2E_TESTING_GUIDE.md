# E2E Testing Guide

This guide covers the end-to-end testing setup and execution for the KOL Matching Platform.

## Overview

The E2E testing suite uses Cypress to validate complete user journeys for both Business and KOL users, ensuring the platform works correctly from a user's perspective.

## Setup

### Prerequisites
- Node.js 18+
- Frontend and backend servers running
- Test data populated in database

### Installation
```bash
cd frontend-nextjs
npm install cypress --save-dev
```

### Configuration
The Cypress configuration is in `cypress.config.ts`:
- Base URL: http://localhost:3000
- Viewport: 1280x720
- Screenshots enabled on failure
- Video recording disabled for faster execution

## Test Structure

### Test Files
- `cypress/e2e/business-user-journey.cy.ts` - Complete business user workflow
- `cypress/e2e/kol-user-journey.cy.ts` - Complete KOL user workflow

### Test Data
- Business User: techcorp@example.com / password123
- KOL User: techreviewer@example.com / password123

## Running Tests

### Interactive Mode
```bash
npm run cypress:open
```
Opens Cypress Test Runner for interactive testing and debugging.

### Headless Mode
```bash
npm run cypress:run
```
Runs all tests in headless mode for CI/CD pipelines.

### Specific Tests
```bash
npm run test:e2e
```
Runs all E2E tests with screenshot capture.

## Test Coverage

### Business User Journey
1. **Landing Page** - Initial platform access
2. **Authentication** - Secure login process
3. **Dashboard** - Business user overview
4. **Campaign Management** - View existing campaigns
5. **Campaign Creation** - Create new marketing campaign
6. **Campaign Confirmation** - Verify successful creation
7. **KOL Discovery** - Search and filter KOLs
8. **Filtered Results** - Apply search criteria
9. **KOL Profile View** - Detailed KOL evaluation
10. **Logout** - Secure session termination

### KOL User Journey
1. **Landing Page** - Platform entry point
2. **Authentication** - KOL login process
3. **Dashboard** - Creator-specific overview
4. **Profile Management** - Update creator profile
5. **Profile Update** - Confirm changes saved
6. **Metrics Integration** - Load YouTube analytics
7. **Campaign Discovery** - Browse opportunities
8. **Campaign Application** - Apply to campaigns
9. **Logout** - Session completion

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
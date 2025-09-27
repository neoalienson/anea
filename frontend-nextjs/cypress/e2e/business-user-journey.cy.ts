describe('Business User Journey', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Complete business user workflow', () => {
    // Step 1: Landing page
    cy.screenshot('01-landing-page')
    cy.contains('KOL Matching Platform').should('be.visible')
    cy.contains('Sign In').click()

    // Step 2: Sign in
    cy.url().should('include', '/auth/signin')
    cy.screenshot('02-signin-page')
    
    cy.get('input[name="email"]').type('techcorp@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    // Step 3: Dashboard
    cy.url().should('include', '/dashboard')
    cy.screenshot('03-business-dashboard')
    cy.contains('Welcome, techcorp@example.com').should('be.visible')
    cy.contains('business').should('be.visible')

    // Step 4: Navigate to Campaigns
    cy.get('[data-testid="nav-campaigns"]').click()
    cy.url().should('include', '/campaigns')
    cy.screenshot('04-campaigns-page')

    // Step 5: Create Campaign
    cy.contains('Create Campaign').click()
    cy.screenshot('05-create-campaign-dialog')
    
    cy.get('input[name="title"]').type('Test E2E Campaign')
    cy.get('textarea[name="description"]').type('This is a test campaign created during E2E testing')
    cy.get('input[name="budget"]').clear().type('10000')
    cy.get('input[name="minFollowers"]').clear().type('50000')
    
    cy.contains('Create Campaign').click()
    cy.screenshot('06-campaign-created')

    // Step 6: Navigate to Discover KOLs
    cy.get('[data-testid="nav-discover"]').click()
    cy.url().should('include', '/discover')
    cy.screenshot('07-discover-kols')

    // Step 7: Search and filter KOLs
    cy.get('input[placeholder="Search KOLs"]').type('tech')
    cy.get('select[name="category"]').select('technology')
    cy.screenshot('08-filtered-kols')

    // Step 8: View KOL profile
    cy.contains('View Profile').first().click()
    cy.screenshot('09-kol-profile-view')

    // Step 9: Sign out
    cy.get('[data-testid="user-menu"]').click()
    cy.contains('Sign Out').click()
    cy.screenshot('10-signed-out')
  })
})
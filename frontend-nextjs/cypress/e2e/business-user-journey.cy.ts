describe('Business User Journey', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Complete business user workflow', () => {
    // Step 1: Landing page
    cy.screenshot('01-landing-page')
    cy.contains('KOL Matching Platform').should('be.visible')
    cy.contains('Connect SMBs with Key Opinion Leaders').should('be.visible')
    cy.contains('Sign In').click()

    // Step 2: Sign in
    cy.url().should('include', '/auth/signin')
    cy.screenshot('02-signin-page')
    
    cy.get('input[name="email"]').type('techcorp@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    // Step 3: Dashboard - Wait for navigation and verify business dashboard
    cy.url().should('include', '/dashboard')
    cy.wait(2000) // Wait for dashboard data to load
    cy.screenshot('03-business-dashboard')
    cy.contains('Good').should('be.visible') // Greeting message
    cy.contains('Business Dashboard').should('be.visible')
    cy.get('[data-testid="nav-campaigns"]').should('be.visible')
    cy.get('[data-testid="nav-discover"]').should('be.visible')

    // Step 4: Navigate to Campaigns
    cy.get('[data-testid="nav-campaigns"]').click()
    cy.url().should('include', '/campaigns')
    cy.wait(1000)
    cy.screenshot('04-campaigns-page')
    cy.contains('My Campaigns').should('be.visible')

    // Step 5: Create Campaign Dialog
    cy.contains('Create Campaign').click()
    cy.screenshot('05-create-campaign-dialog')
    
    // Fill campaign form
    cy.get('input[name="title"]').type('E2E Test Campaign')
    cy.get('textarea[name="description"]').type('This is a test campaign created during E2E testing for validation purposes')
    cy.get('input[name="budget"]').clear().type('15000')
    cy.get('input[name="minFollowers"]').clear().type('25000')
    
    // Submit campaign creation
    cy.contains('button', 'Create Campaign').click()
    cy.wait(2000) // Wait for campaign creation
    cy.screenshot('06-campaign-created')
    cy.contains('Campaign created successfully').should('be.visible')

    // Step 6: Navigate to Discover KOLs
    cy.get('[data-testid="nav-discover"]').click()
    cy.url().should('include', '/discover')
    cy.wait(1000)
    cy.screenshot('07-discover-kols')
    cy.contains('AI - powered KOL Discovery').should('be.visible')

    // Step 7: Search and filter KOLs
    cy.get('input[placeholder*="Search KOLs"]').type('tech')
    cy.get('select[name="category"]').select('technology')
    cy.wait(1000)
    cy.screenshot('08-filtered-kols')
    cy.contains('KOLs found').should('be.visible')

    // Step 8: View KOL profile (if available)
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("View Profile")').length > 0) {
        cy.contains('View Profile').first().click()
        cy.screenshot('09-kol-profile-view')
      } else {
        cy.screenshot('09-no-kols-available')
      }
    })

    // Step 9: Navigate back to dashboard
    cy.contains('Dashboard').click()
    cy.url().should('include', '/dashboard')
    cy.screenshot('10-back-to-dashboard')

    // Step 10: Sign out
    cy.get('[data-testid="user-menu"]').click()
    cy.contains('Sign Out').click()
    cy.wait(1000)
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.screenshot('11-signed-out')
  })
})
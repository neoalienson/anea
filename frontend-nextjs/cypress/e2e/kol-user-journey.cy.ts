describe('KOL User Journey', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Complete KOL user workflow', () => {
    // Step 1: Landing page
    cy.screenshot('kol-01-landing-page')
    cy.contains('KOL Matching Platform').should('be.visible')
    cy.contains('Sign In').click()

    // Step 2: Sign in as KOL
    cy.url().should('include', '/auth/signin')
    cy.screenshot('kol-02-signin-page')
    
    cy.get('input[name="email"]').type('techreviewer@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    // Step 3: KOL Dashboard
    cy.url().should('include', '/dashboard')
    cy.screenshot('kol-03-dashboard')
    cy.contains('Welcome, techreviewer@example.com').should('be.visible')
    cy.contains('kol').should('be.visible')

    // Step 4: Navigate to Profile
    cy.get('[data-testid="nav-profile"]').click()
    cy.url().should('include', '/profile')
    cy.screenshot('kol-04-profile-page')

    // Step 5: Update Profile
    cy.get('input[name="displayName"]').clear().type('Tech Reviewer Pro - E2E Test')
    cy.get('textarea[name="bio"]').clear().type('Updated bio during E2E testing - Professional tech reviewer')
    cy.get('input[name="youtubeUrl"]').clear().type('https://youtube.com/@techreviewerpro-e2e')
    cy.get('input[name="twitterHandle"]').clear().type('@techreviewer_e2e')
    cy.get('input[name="language"]').clear().type('English')
    
    cy.contains('Update Profile').click()
    cy.screenshot('kol-05-profile-updated')

    // Step 6: Load YouTube Metrics
    cy.contains('Load YouTube Metrics').click()
    cy.wait(2000) // Wait for API call
    cy.screenshot('kol-06-metrics-loaded')

    // Step 7: Browse Campaigns
    cy.get('[data-testid="nav-campaigns"]').click()
    cy.url().should('include', '/campaigns')
    cy.screenshot('kol-07-browse-campaigns')

    // Step 8: View Campaign Details
    cy.contains('Apply').first().click()
    cy.screenshot('kol-08-campaign-application')

    // Step 9: Sign out
    cy.get('[data-testid="user-menu"]').click()
    cy.contains('Sign Out').click()
    cy.screenshot('kol-09-signed-out')
  })
})
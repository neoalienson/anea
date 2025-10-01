describe('KOL User Journey', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Complete KOL user workflow', () => {
    // Step 1: Landing page
    cy.screenshot('kol-01-landing-page')
    cy.contains('KOL Matching Platform').should('be.visible')
    cy.contains('Connect SMBs with Key Opinion Leaders').should('be.visible')
    cy.contains('Sign In').click()

    // Step 2: Sign in as KOL
    cy.url().should('include', '/auth/signin')
    cy.screenshot('kol-02-signin-page')
    
    cy.get('input[name="email"]').type('techreviewer@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    // Step 3: KOL Dashboard - Wait for navigation and verify KOL dashboard
    cy.url().should('include', '/dashboard')
    cy.wait(2000) // Wait for dashboard data to load
    cy.screenshot('kol-03-dashboard')
    cy.contains('Good').should('be.visible') // Greeting message
    cy.contains('Content Creator Dashboard').should('be.visible')
    cy.get('[data-testid="nav-profile"]').should('be.visible')
    cy.get('[data-testid="nav-campaigns"]').should('be.visible')

    // Step 4: Navigate to Profile
    cy.get('[data-testid="nav-profile"]').click()
    cy.url().should('include', '/profile')
    cy.wait(1000)
    cy.screenshot('kol-04-profile-page')
    cy.contains('KOL Profile').should('be.visible')

    // Step 5: Update Profile Information
    cy.get('input[name="displayName"]').clear().type('Tech Reviewer Pro - E2E Updated')
    cy.get('textarea[name="bio"]').clear().type('Updated bio during E2E testing - Professional tech reviewer with expertise in consumer electronics and software')
    cy.get('input[name="youtubeUrl"]').clear().type('https://youtube.com/@techreviewerpro-e2e')
    cy.get('input[name="twitterHandle"]').clear().type('@techreviewer_e2e')
    cy.get('input[name="language"]').clear().type('English')
    
    cy.contains('Update Profile').click()
    cy.wait(1000)
    cy.screenshot('kol-05-profile-updated')
    cy.contains('Profile updated successfully').should('be.visible')

    // Step 6: Load YouTube Metrics
    cy.contains('Load YouTube Metrics').click()
    cy.wait(3000) // Wait for API call to complete
    cy.screenshot('kol-06-metrics-loaded')
    cy.contains('YouTube metrics loaded successfully').should('be.visible')

    // Step 7: Browse Available Campaigns
    cy.get('[data-testid="nav-campaigns"]').click()
    cy.url().should('include', '/campaigns')
    cy.wait(1000)
    cy.screenshot('kol-07-browse-campaigns')
    cy.contains('Available Campaigns').should('be.visible')

    // Step 8: View Campaign Details and Apply (if campaigns available)
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Apply")').length > 0) {
        cy.contains('Apply').first().click()
        cy.screenshot('kol-08-campaign-application')
      } else {
        cy.screenshot('kol-08-no-campaigns-available')
      }
    })

    // Step 9: Check My Applications
    cy.get('[data-testid="nav-my-applications"]').click()
    cy.url().should('include', '/my-applications')
    cy.wait(1000)
    cy.screenshot('kol-09-my-applications')

    // Step 10: Navigate back to dashboard
    cy.contains('Dashboard').click()
    cy.url().should('include', '/dashboard')
    cy.screenshot('kol-10-back-to-dashboard')

    // Step 11: Sign out
    cy.get('[data-testid="user-menu"]').click()
    cy.contains('Sign Out').click()
    cy.wait(1000)
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.screenshot('kol-11-signed-out')
  })
})
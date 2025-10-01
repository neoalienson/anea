describe('Simple Test', () => {
  it('should load the landing page', () => {
    cy.visit('/')
    cy.contains('KOL Matching Platform').should('be.visible')
    cy.screenshot('simple-test-landing')
  })
})
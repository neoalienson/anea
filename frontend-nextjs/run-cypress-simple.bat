@echo off
echo Starting Cypress E2E Tests...
cd /d "c:\Projects\kolmatching\frontend-nextjs"
npx cypress run --spec "cypress/e2e/simple-test.cy.ts" --headless --browser electron
echo Test execution completed.
pause
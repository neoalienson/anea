#!/usr/bin/env node

/**
 * E2E Test Runner for KOL Matching Platform
 * 
 * This script runs the E2E tests and generates a summary report
 * without blocking the development workflow.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEST_RESULTS_DIR = path.join(__dirname, 'test-results');
const REPORT_FILE = path.join(TEST_RESULTS_DIR, 'e2e-test-report.json');

// Ensure test results directory exists
if (!fs.existsSync(TEST_RESULTS_DIR)) {
  fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
}

function runPlaywrightTests() {
  return new Promise((resolve, reject) => {
    console.log('🎭 Running Playwright E2E Tests...');
    
    const playwright = spawn('npx', ['playwright', 'test'], {
      stdio: 'pipe',
      shell: true
    });

    let stdout = '';
    let stderr = '';

    playwright.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });

    playwright.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });

    playwright.on('close', (code) => {
      const result = {
        framework: 'Playwright',
        exitCode: code,
        success: code === 0,
        stdout,
        stderr,
        timestamp: new Date().toISOString()
      };
      
      if (code === 0) {
        console.log('✅ Playwright tests completed successfully');
        resolve(result);
      } else {
        console.log('❌ Playwright tests failed');
        resolve(result); // Still resolve to continue with report generation
      }
    });

    playwright.on('error', (error) => {
      console.error('Failed to start Playwright tests:', error);
      reject(error);
    });
  });
}

function runCypressTests() {
  return new Promise((resolve, reject) => {
    console.log('🌲 Running Cypress E2E Tests...');
    
    const cypress = spawn('npx', ['cypress', 'run'], {
      stdio: 'pipe',
      shell: true
    });

    let stdout = '';
    let stderr = '';

    cypress.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });

    cypress.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });

    cypress.on('close', (code) => {
      const result = {
        framework: 'Cypress',
        exitCode: code,
        success: code === 0,
        stdout,
        stderr,
        timestamp: new Date().toISOString()
      };
      
      if (code === 0) {
        console.log('✅ Cypress tests completed successfully');
        resolve(result);
      } else {
        console.log('❌ Cypress tests failed');
        resolve(result); // Still resolve to continue with report generation
      }
    });

    cypress.on('error', (error) => {
      console.error('Failed to start Cypress tests:', error);
      reject(error);
    });
  });
}

function generateReport(results) {
  const report = {
    testRun: {
      timestamp: new Date().toISOString(),
      platform: 'KOL Matching Platform',
      environment: 'development'
    },
    results,
    summary: {
      totalFrameworks: results.length,
      successfulFrameworks: results.filter(r => r.success).length,
      failedFrameworks: results.filter(r => !r.success).length,
      overallSuccess: results.every(r => r.success)
    }
  };

  // Write JSON report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

  // Generate markdown summary
  const markdownReport = generateMarkdownReport(report);
  fs.writeFileSync(path.join(TEST_RESULTS_DIR, 'e2e-test-summary.md'), markdownReport);

  console.log('\n📊 Test Report Generated:');
  console.log(`   JSON: ${REPORT_FILE}`);
  console.log(`   Markdown: ${path.join(TEST_RESULTS_DIR, 'e2e-test-summary.md')}`);
  
  return report;
}

function generateMarkdownReport(report) {
  const { testRun, results, summary } = report;
  
  return `# E2E Test Report

## Test Run Information
- **Timestamp**: ${testRun.timestamp}
- **Platform**: ${testRun.platform}
- **Environment**: ${testRun.environment}

## Summary
- **Total Frameworks**: ${summary.totalFrameworks}
- **Successful**: ${summary.successfulFrameworks}
- **Failed**: ${summary.failedFrameworks}
- **Overall Success**: ${summary.overallSuccess ? '✅ PASS' : '❌ FAIL'}

## Framework Results

${results.map(result => `
### ${result.framework}
- **Status**: ${result.success ? '✅ PASS' : '❌ FAIL'}
- **Exit Code**: ${result.exitCode}
- **Timestamp**: ${result.timestamp}

${result.success ? '**Test completed successfully**' : '**Test failed - check logs for details**'}
`).join('\n')}

## Screenshots
Screenshots are automatically captured during test execution and stored in the \`test-results/\` directory.

### Business User Journey Screenshots
- \`01-landing-page.png\` - Platform landing page
- \`02-signin-page.png\` - Authentication interface
- \`03-business-dashboard.png\` - Business dashboard overview
- \`04-campaigns-page.png\` - Campaign management interface
- \`05-create-campaign-dialog.png\` - Campaign creation form
- \`06-campaign-created.png\` - Campaign creation confirmation
- \`07-discover-kols.png\` - KOL discovery platform
- \`08-filtered-kols.png\` - Search and filtering results
- \`09-back-to-dashboard.png\` - Dashboard navigation
- \`10-signed-out.png\` - Secure logout confirmation

### KOL User Journey Screenshots
- \`kol-01-landing-page.png\` - Platform entry point
- \`kol-02-signin-page.png\` - Creator authentication
- \`kol-03-dashboard.png\` - Creator dashboard
- \`kol-04-profile-page.png\` - Profile management interface
- \`kol-05-profile-updated.png\` - Profile update confirmation
- \`kol-06-metrics-loaded.png\` - YouTube metrics integration
- \`kol-07-browse-campaigns.png\` - Campaign discovery
- \`kol-08-my-applications.png\` - Application management
- \`kol-09-back-to-dashboard.png\` - Dashboard return
- \`kol-10-signed-out.png\` - Secure logout

## Next Steps
${summary.overallSuccess 
  ? '✅ All tests passed! The platform is ready for deployment.' 
  : '❌ Some tests failed. Review the logs and fix issues before deployment.'}
`;
}

async function main() {
  console.log('🚀 Starting E2E Test Suite for KOL Matching Platform\n');
  
  const results = [];
  
  try {
    // Run Playwright tests (primary framework)
    const playwrightResult = await runPlaywrightTests();
    results.push(playwrightResult);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Run Cypress tests (secondary framework)
    const cypressResult = await runCypressTests();
    results.push(cypressResult);
    
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
  
  // Generate comprehensive report
  const report = generateReport(results);
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 E2E Test Suite Complete');
  console.log('='.repeat(50));
  
  if (report.summary.overallSuccess) {
    console.log('🎉 All tests passed! Platform is ready for deployment.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Review the report for details.');
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runPlaywrightTests, runCypressTests, generateReport };
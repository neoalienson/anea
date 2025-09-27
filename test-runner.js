#!/usr/bin/env node

/**
 * Comprehensive Test Runner for KOL Platform
 * Runs all test suites and generates coverage reports
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class TestRunner {
  constructor() {
    this.results = {
      backend: { passed: false, coverage: 0 },
      frontend: { passed: false, coverage: 0 },
      integration: { passed: false },
      e2e: { passed: false }
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async runCommand(command, args, cwd, description) {
    return new Promise((resolve, reject) => {
      this.log(`\n🔄 ${description}...`, 'cyan');
      
      const process = spawn(command, args, {
        cwd,
        stdio: 'inherit',
        shell: true
      });

      process.on('close', (code) => {
        if (code === 0) {
          this.log(`✅ ${description} completed successfully`, 'green');
          resolve(true);
        } else {
          this.log(`❌ ${description} failed with code ${code}`, 'red');
          resolve(false);
        }
      });

      process.on('error', (error) => {
        this.log(`❌ ${description} error: ${error.message}`, 'red');
        resolve(false);
      });
    });
  }

  async runBackendTests() {
    this.log('\n📦 Running Backend Tests', 'magenta');
    
    const backendPath = path.join(__dirname, 'backend');
    
    // Install dependencies if needed
    if (!fs.existsSync(path.join(backendPath, 'node_modules'))) {
      await this.runCommand('npm', ['install'], backendPath, 'Installing backend dependencies');
    }

    // Run unit tests with coverage
    const unitTestsPassed = await this.runCommand(
      'npm', 
      ['run', 'test:coverage'], 
      backendPath, 
      'Backend unit tests with coverage'
    );

    // Run integration tests
    const integrationTestsPassed = await this.runCommand(
      'npm', 
      ['run', 'test:integration'], 
      backendPath, 
      'Backend integration tests'
    );

    this.results.backend.passed = unitTestsPassed && integrationTestsPassed;
    
    // Extract coverage percentage (simplified)
    try {
      const coverageFile = path.join(backendPath, 'coverage', 'coverage-summary.json');
      if (fs.existsSync(coverageFile)) {
        const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
        this.results.backend.coverage = coverage.total.lines.pct || 0;
      }
    } catch (error) {
      this.log(`⚠️  Could not read backend coverage: ${error.message}`, 'yellow');
    }

    return this.results.backend.passed;
  }

  async runFrontendTests() {
    this.log('\n🎨 Running Frontend Tests', 'magenta');
    
    const frontendPath = path.join(__dirname, 'frontend');
    
    // Install dependencies if needed
    if (!fs.existsSync(path.join(frontendPath, 'node_modules'))) {
      await this.runCommand('npm', ['install'], frontendPath, 'Installing frontend dependencies');
    }

    // Run tests with coverage
    const testsPassed = await this.runCommand(
      'npm', 
      ['run', 'test:coverage'], 
      frontendPath, 
      'Frontend tests with coverage'
    );

    this.results.frontend.passed = testsPassed;
    
    // Extract coverage percentage (simplified)
    try {
      const coverageFile = path.join(frontendPath, 'coverage', 'coverage-summary.json');
      if (fs.existsSync(coverageFile)) {
        const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
        this.results.frontend.coverage = coverage.total.lines.pct || 0;
      }
    } catch (error) {
      this.log(`⚠️  Could not read frontend coverage: ${error.message}`, 'yellow');
    }

    return this.results.frontend.passed;
  }

  async runE2ETests() {
    this.log('\n🔄 Running E2E Tests', 'magenta');
    
    // Check if services are running
    const healthCheck = await this.checkServices();
    if (!healthCheck) {
      this.log('❌ Services not running, skipping E2E tests', 'red');
      return false;
    }

    // Run Cypress E2E tests (if configured)
    const e2ePassed = await this.runCommand(
      'npx', 
      ['cypress', 'run', '--headless'], 
      __dirname, 
      'E2E tests with Cypress'
    );

    this.results.e2e.passed = e2ePassed;
    return e2ePassed;
  }

  async checkServices() {
    try {
      const http = require('http');
      
      // Check backend health
      const backendHealthy = await new Promise((resolve) => {
        const req = http.get('http://localhost:8000/health', (res) => {
          resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(5000, () => {
          req.destroy();
          resolve(false);
        });
      });

      // Check frontend
      const frontendHealthy = await new Promise((resolve) => {
        const req = http.get('http://localhost:3000', (res) => {
          resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(5000, () => {
          req.destroy();
          resolve(false);
        });
      });

      return backendHealthy && frontendHealthy;
    } catch (error) {
      return false;
    }
  }

  generateReport() {
    this.log('\n📊 Test Results Summary', 'cyan');
    this.log('=' .repeat(50), 'cyan');
    
    // Backend results
    const backendStatus = this.results.backend.passed ? '✅ PASSED' : '❌ FAILED';
    this.log(`Backend Tests: ${backendStatus} (Coverage: ${this.results.backend.coverage.toFixed(1)}%)`, 
      this.results.backend.passed ? 'green' : 'red');
    
    // Frontend results
    const frontendStatus = this.results.frontend.passed ? '✅ PASSED' : '❌ FAILED';
    this.log(`Frontend Tests: ${frontendStatus} (Coverage: ${this.results.frontend.coverage.toFixed(1)}%)`, 
      this.results.frontend.passed ? 'green' : 'red');
    
    // E2E results
    const e2eStatus = this.results.e2e.passed ? '✅ PASSED' : '❌ FAILED';
    this.log(`E2E Tests: ${e2eStatus}`, 
      this.results.e2e.passed ? 'green' : 'red');
    
    // Overall status
    const allPassed = Object.values(this.results).every(result => result.passed);
    const overallStatus = allPassed ? '🎉 ALL TESTS PASSED' : '💥 SOME TESTS FAILED';
    this.log(`\nOverall Status: ${overallStatus}`, allPassed ? 'green' : 'red');
    
    // Coverage summary
    const avgCoverage = (this.results.backend.coverage + this.results.frontend.coverage) / 2;
    this.log(`Average Coverage: ${avgCoverage.toFixed(1)}%`, 
      avgCoverage >= 70 ? 'green' : avgCoverage >= 50 ? 'yellow' : 'red');
    
    this.log('=' .repeat(50), 'cyan');
    
    return allPassed;
  }

  async run() {
    this.log('🚀 Starting KOL Platform Test Suite', 'cyan');
    this.log(`Timestamp: ${new Date().toISOString()}`, 'blue');
    
    const startTime = Date.now();
    
    try {
      // Run all test suites
      await this.runBackendTests();
      await this.runFrontendTests();
      await this.runE2ETests();
      
      // Generate final report
      const success = this.generateReport();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.log(`\n⏱️  Total execution time: ${duration}s`, 'blue');
      
      // Exit with appropriate code
      process.exit(success ? 0 : 1);
      
    } catch (error) {
      this.log(`\n💥 Test runner error: ${error.message}`, 'red');
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.run();
}

module.exports = TestRunner;
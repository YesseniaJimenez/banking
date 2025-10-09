# Banking API Load Tests

This directory contains Artillery load tests for the banking API.

## Test Overview

The `banking-test.yml` test performs the following operations:

1. **Creates 100 users** with initial balance of 1000
2. **Performs banking operations** for each user:
   - Deposit 500 (balance should be 1500)
   - Withdraw 200 (balance should be 1300)
   - Deposit 100 (balance should be 1400)
3. **Validates balance** after each operation using a custom processor

## Running the Tests

Make sure your banking API is running on `http://localhost:3000`, then execute:

```bash
npm run load-test
```

## Test Configuration

- **Duration**: 60 seconds
- **Arrival Rate**: 10 virtual users per second
- **Target**: http://localhost:3000

## Custom Processor

The `processor.js` file contains a custom function `validateBalance` that:
- Checks if balance calculations are correct after each operation
- Logs validation results (✅ for success, ❌ for failures)
- Tracks balance accuracy throughout the transaction flow

## Expected Results

- All users should be created successfully
- All transactions (deposit/withdraw) should complete without errors
- Final balance validation should pass for all users
- The test will show pass/fail indicators in the console output

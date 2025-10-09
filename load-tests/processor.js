module.exports = {
  validateBalance: validateBalance
};

/**
 * Custom function to validate the balance calculations
 */
function validateBalance(context, events, done) {
  // Get the balances from context
  const initialBalance = parseFloat(context.vars.initialBalance) || 0;
  const balanceAfterDeposit = parseFloat(context.vars.balanceAfterDeposit) || 0;
  const balanceAfterWithdraw = parseFloat(context.vars.balanceAfterWithdraw) || 0;
  const finalBalance = parseFloat(context.vars.finalBalance) || 0;

  // Expected calculations
  const expectedAfterDeposit = initialBalance + 500; // Initial + 500 deposit
  const expectedAfterWithdraw = expectedAfterDeposit - 200; // After deposit - 200 withdrawal
  const expectedFinal = expectedAfterWithdraw + 100; // After withdraw + 100 deposit

  // Validate each step
  const depositValid = balanceAfterDeposit === expectedAfterDeposit;
  const withdrawValid = balanceAfterWithdraw === expectedAfterWithdraw;
  const finalValid = finalBalance === expectedFinal;

  // Log validation results
  if (!depositValid) {
    console.error(`❌ Deposit validation failed: Expected ${expectedAfterDeposit}, got ${balanceAfterDeposit}`);
  }

  if (!withdrawValid) {
    console.error(`❌ Withdraw validation failed: Expected ${expectedAfterWithdraw}, got ${balanceAfterWithdraw}`);
  }

  if (!finalValid) {
    console.error(`❌ Final balance validation failed: Expected ${expectedFinal}, got ${finalBalance}`);
  }

  if (depositValid && withdrawValid && finalValid) {
    console.log(`✅ Balance validation passed for user. Final balance: ${finalBalance}`);
  }

  // Store validation result in context
  context.vars.balanceValid = depositValid && withdrawValid && finalValid;

  return done();
}

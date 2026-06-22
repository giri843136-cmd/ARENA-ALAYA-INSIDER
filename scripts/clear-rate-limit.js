/**
 * Clear rate limiting data and unblock the user account
 * Run: node scripts/clear-rate-limit.js
 */
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const email = 'alayainsider@gmail.com';

  // 1. Clear recent failed login attempts
  const delResult = await pool.query(
    "DELETE FROM \"LoginAttempt\" WHERE email = $1 AND success = false",
    [email]
  );
  console.log(`Deleted ${delResult.rowCount} failed login attempts for ${email}`);

  // 2. Check if user is blocked
  const userResult = await pool.query(
    "SELECT id, blocked FROM \"User\" WHERE email = $1",
    [email]
  );
  const user = userResult.rows[0];
  if (!user) {
    console.log('ERROR: User not found!');
    return;
  }
  console.log(`User ${user.id} blocked status: ${user.blocked}`);

  // 3. Unblock if blocked
  if (user.blocked) {
    await pool.query(
      "UPDATE \"User\" SET blocked = false WHERE id = $1",
      [user.id]
    );
    console.log('User UNBLOCKED successfully!');
  } else {
    console.log('User was not blocked - OK');
  }

  console.log('\n✅ Rate limit cleared! Try logging in now.');
  console.log('Email: alayainsider@gmail.com');
  console.log('Password: AlayaAdmin2026!');

  await pool.end();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

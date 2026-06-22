const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const { PrismaClient } = require('@prisma/client');
async function main() {
  try {
    const client = new PrismaClient({ adapter });
    const user = await client.user.findUnique({ where: { email: 'alayainsider@gmail.com' } });
    if (user) {
      console.log('USER FOUND:', user.email, 'HASH:', user.passwordHash ? 'YES' : 'NO');
    } else {
      console.log('USER NOT FOUND');
    }
    await client.$disconnect();
  } catch(e) {
    console.log('ERROR:', e.message);
    console.log('STACK:', e.stack?.substring(0, 500));
  }
  process.exit(0);
}
main();

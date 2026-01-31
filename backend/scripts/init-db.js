const { execSync } = require('child_process');

console.log('Initialize Database for Vercel...');

try {
    // Ensure we are using the postgres schema
    console.log('Swapping to Postgres Schema...');
    execSync('cp prisma/schema.postgres.prisma prisma/schema.prisma');
    
    // Deploy migrations (creates tables)
    console.log('Deploying migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Seed data (optional)
    // console.log('Seeding database...');
    // execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit' });
    
    console.log('Database initialized successfully!');
} catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
}

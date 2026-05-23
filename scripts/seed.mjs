/**
 * Seed dummy accounts for local development.
 * Run: npm run db:seed
 */
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config({ path: '.env' });

const db = new PrismaClient();

const DUMMY_EMAILS = [
  'superadmin@bumdes.local',
  'admin@bumdes.local',
  'member@bumdes.local',
];

const PASSWORD = 'Password123!';

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('Seeding dummy accounts...\n');

  const passwordHash = await hashPassword(PASSWORD);

  // Remove old dummy data (order matters for FKs)
  const existingUsers = await db.user.findMany({
    where: { email: { in: DUMMY_EMAILS } },
    select: { id: true },
  });
  const userIds = existingUsers.map((u) => u.id);

  if (userIds.length > 0) {
    await db.member.deleteMany({ where: { userId: { in: userIds } } });
    await db.user.deleteMany({ where: { id: { in: userIds } } });
  }

  await db.user.deleteMany({
    where: {
      phone: { in: ['081111111111', '082222222222', '081234567890'] },
    },
  });

  let organization = await db.organization.findFirst({
    where: { code: 'BUMDES-DEMO' },
  });

  if (!organization) {
    organization = await db.organization.create({
      data: {
        name: 'BUMDES Demo',
        code: 'BUMDES-DEMO',
        address: 'Jl. Contoh No. 1, Jakarta',
        email: 'demo@bumdes.local',
        phone: '02112345678',
        isActive: true,
      },
    });
    console.log('Created organization:', organization.name);
  }

  await db.systemSettings.upsert({
    where: { bumdesId: organization.id },
    create: {
      bumdesId: organization.id,
      depositPointRate: 10,
      rewardExchangeRate: 100,
    },
    update: {},
  });

  const categoryCount = await db.wasteCategory.count({
    where: { bumdesId: organization.id },
  });
  if (categoryCount === 0) {
    await db.wasteCategory.createMany({
      data: [
        {
          bumdesId: organization.id,
          name: 'Organik',
          description: 'Sampah organik',
          pointsPerKg: 10,
          isActive: true,
        },
        {
          bumdesId: organization.id,
          name: 'Daun',
          description: 'Daun kering',
          pointsPerKg: 8,
          isActive: true,
        },
      ],
    });
    console.log('Created waste categories');
  }

  const superAdmin = await db.user.create({
    data: {
      email: 'superadmin@bumdes.local',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash,
      role: 'super_admin',
      isActive: true,
    },
  });

  await db.user.create({
    data: {
      email: 'admin@bumdes.local',
      firstName: 'Admin',
      lastName: 'BUMDES',
      phone: '081111111111',
      passwordHash,
      role: 'admin_bumdes',
      bumdesId: organization.id,
      isActive: true,
    },
  });

  const memberUser = await db.user.create({
    data: {
      email: 'member@bumdes.local',
      firstName: 'Member',
      lastName: 'Demo',
      phone: '082222222222',
      passwordHash,
      role: 'member',
      bumdesId: organization.id,
      isActive: true,
    },
  });

  await db.member.create({
    data: {
      userId: memberUser.id,
      bumdesId: organization.id,
      memberNumber: 'MBR-DEMO-001',
      fullName: 'Member Demo',
      phone: '082222222222',
      address: 'Jl. Member No. 1',
      status: 'active',
      totalPoints: new Prisma.Decimal(150),
      totalDeposits: new Prisma.Decimal(15),
      totalWithdrawals: new Prisma.Decimal(0),
    },
  });

  console.log('\nDummy accounts ready:\n');
  console.log('| Role        | Email                      | Password      | Dashboard                    |');
  console.log('|-------------|----------------------------|---------------|------------------------------|');
  console.log('| Super Admin | superadmin@bumdes.local    | Password123!  | /app/super-admin/dashboard   |');
  console.log('| Admin BUMDES| admin@bumdes.local         | Password123!  | /app/admin/dashboard         |');
  console.log('| Member      | member@bumdes.local        | Password123!  | /app/member/dashboard        |');
  console.log('\nOrganization ID (for register link):', organization.id);
  console.log(`Register URL: http://localhost:3000/register?bumdesId=${organization.id}`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

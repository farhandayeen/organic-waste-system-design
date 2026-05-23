import { db } from '@/db';
import { hash } from 'bcryptjs';

async function seedDummyUsers() {
  console.log('Creating dummy users...');

  try {
    // Delete existing dummy users if any
    await db.user.deleteMany({
      where: {
        email: {
          in: [
            'admin@bumdes.local',
            'member@bumdes.local',
            'superadmin@bumdes.local',
          ],
        },
      },
    });

    // Create dummy organization
    let organization = await db.organization.findFirst();
    if (!organization) {
      organization = await db.organization.create({
        data: {
          name: 'BUMDES Test',
          address: 'Test City',
        },
      });
      console.log('Created organization:', organization.name);
    }

    // Create Super Admin
    const superAdminPassword = await hash('password123', 10);
    const superAdmin = await db.user.create({
      data: {
        email: 'superadmin@bumdes.local',
        firstName: 'Super',
        lastName: 'Admin',
        passwordHash: superAdminPassword,
        role: 'super_admin',
        isActive: true,
        bumdesId: organization.id,
      },
    });
    console.log('Created Super Admin:', superAdmin.email);

    // Create Admin BUMDES
    const adminPassword = await hash('password123', 10);
    const admin = await db.user.create({
      data: {
        email: 'admin@bumdes.local',
        firstName: 'Admin',
        lastName: 'BUMDES',
        passwordHash: adminPassword,
        role: 'admin_bumdes',
        isActive: true,
        bumdesId: organization.id,
      },
    });
    console.log('Created Admin BUMDES:', admin.email);

    // Create Member
    const memberPassword = await hash('password123', 10);
    const memberUser = await db.user.create({
      data: {
        email: 'member@bumdes.local',
        firstName: 'Member',
        lastName: 'Test',
        passwordHash: memberPassword,
        role: 'member',
        isActive: true,
        bumdesId: organization.id,
      },
    });
    console.log('Created Member:', memberUser.email);

    // Create member profile
    const member = await db.member.create({
      data: {
        userId: memberUser.id,
        bumdesId: organization.id,
        fullName: 'Member Test',
        phone: '08123456789',
        address: 'Test Address',
        totalPoints: 0,
      },
    });
    console.log('Created Member Profile:', member.fullName);

    console.log('\nDummy users created successfully!');
    console.log('\nTest Credentials:');
    console.log('Super Admin - Email: superadmin@bumdes.local, Password: password123');
    console.log('Admin BUMDES - Email: admin@bumdes.local, Password: password123');
    console.log('Member - Email: member@bumdes.local, Password: password123');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDummyUsers().then(() => process.exit(0));

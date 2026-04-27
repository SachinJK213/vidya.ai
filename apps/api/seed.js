const { PrismaClient } = require('../../node_modules/.prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://vidyaai:vidyaai@localhost:5432/vidyaai' } },
});

async function seed() {
  const tenant = await prisma.tenant.upsert({
    where: { code: 'demo' },
    update: {},
    create: { name: 'Demo School', code: 'demo', deploymentMode: 'SAAS' },
  });
  console.log('Tenant:', tenant.code, tenant.id);

  const hash = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@demo.school' } },
    update: {},
    create: { tenantId: tenant.id, email: 'admin@demo.school', passwordHash: hash, role: 'SCHOOL_ADMIN', firstName: 'Demo', lastName: 'Admin' },
  });
  console.log('Admin:', admin.email);

  const teacher = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'teacher@demo.school' } },
    update: {},
    create: { tenantId: tenant.id, email: 'teacher@demo.school', passwordHash: hash, role: 'TEACHER', firstName: 'Anita', lastName: 'Sharma' },
  });
  console.log('Teacher:', teacher.email);

  const parent = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'parent@demo.school' } },
    update: {},
    create: { tenantId: tenant.id, email: 'parent@demo.school', passwordHash: hash, role: 'PARENT', firstName: 'Rajan', lastName: 'Mehta' },
  });
  console.log('Parent:', parent.email);

  const family = await prisma.family.upsert({
    where: { tenantId_familyCode: { tenantId: tenant.id, familyCode: 'MEHTA001' } },
    update: {},
    create: { tenantId: tenant.id, familyCode: 'MEHTA001' },
  });

  await prisma.familyMember.upsert({
    where: { familyId_userId: { familyId: family.id, userId: parent.id } },
    update: {},
    create: { familyId: family.id, userId: parent.id, relationship: 'Father', isPrimary: true },
  });

  const student = await prisma.student.upsert({
    where: { tenantId_admissionNo: { tenantId: tenant.id, admissionNo: 'ADM001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      familyId: family.id,
      admissionNo: 'ADM001',
      firstName: 'Arjun',
      lastName: 'Mehta',
      dateOfBirth: new Date('2015-04-10'),
      gender: 'MALE',
      grade: '5',
      section: 'A',
      rollNo: '1',
    },
  });
  console.log('Student:', student.firstName, student.lastName);

  console.log('\nSeed complete! Login credentials (password: password123):');
  console.log('  School code : demo');
  console.log('  Admin       : admin@demo.school');
  console.log('  Teacher     : teacher@demo.school');
  console.log('  Parent      : parent@demo.school');

  await prisma.$disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });

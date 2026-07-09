import 'dotenv/config';
import bcrypt from 'bcrypt';

import prisma from '../src/config/database.config.js';

const SEED_PASSWORD = process.env.SEED_PASSWORD;

if (!SEED_PASSWORD) {
  console.error(
    'Please set the SEED_PASSWORD environment variable to create seed users. Exiting...',
  );
  process.exit(1);
}

const USERS = [
  {
    id: 'cmrbxq9vb0000ksuzes116jo9',
    fullName: 'Seed User One',
    email: 'seed.user.one@yopmail.com',
    password: SEED_PASSWORD,
    role: 'EMPLOYEE',
    department: 'Engineering',
    designation: 'Developer',
  },
  {
    id: 'cmrbxyle00003qcuzsu1lr5r4',
    fullName: 'Seed User Two',
    email: 'seed.user.two@yopmail.com',
    password: SEED_PASSWORD,
    role: 'EMPLOYEE',
    department: 'Product',
    designation: 'Product Manager',
  },
  {
    id: 'cmrbxz0000001abcdeff1',
    fullName: 'Seed User Three',
    email: 'seed.user.three@yopmail.com',
    password: SEED_PASSWORD,
    role: 'EMPLOYEE',
    department: 'Design',
    designation: 'Designer',
  },
  {
    id: 'cmrbxz0000002ghijkk22',
    fullName: 'Seed User Four',
    email: 'seed.user.four@yopmail.com',
    password: SEED_PASSWORD,
    role: 'EMPLOYEE',
    department: 'QA',
    designation: 'QA Engineer',
  },
  {
    id: 'cmrbxz0000003lmnopq33',
    fullName: 'Seed User Five',
    email: 'seed.user.five@yopmail.com',
    password: SEED_PASSWORD,
    role: 'EMPLOYEE',
    department: 'Support',
    designation: 'Support Engineer',
  },
];

const TASKS = (userId) => [
  {
    id: `${userId}-t1`,
    title: 'Prepare weekly report',
    description: 'Collect metrics and prepare the weekly status report.',
    priority: 'HIGH',
    status: 'PENDING',
    startDate: new Date(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    assignedToId: userId,
  },
  {
    id: `${userId}-t2`,
    title: 'Update project documentation',
    description: 'Refresh API docs and onboarding guides.',
    priority: 'MEDIUM',
    status: 'PENDING',
    startDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    assignedToId: userId,
  },
  {
    id: `${userId}-t3`,
    title: 'Fix critical bug',
    description: 'Investigate and fix the crash happening on login.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    startDate: new Date(),
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    assignedToId: userId,
  },
];

async function main() {
  try {
    const createdUsers = [];

    for (const u of USERS) {
      const passwordHash = await bcrypt.hash(u.password, 12);

      const user = await prisma.user.upsert({
        where: { id: u.id },
        update: {
          fullName: u.fullName,
          email: u.email,
          password: passwordHash,
          role: u.role,
          department: u.department,
          designation: u.designation,
        },
        create: {
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          password: passwordHash,
          role: u.role,
          department: u.department,
          designation: u.designation,
        },
      });

      createdUsers.push(user);

      const tasks = TASKS(u.id);
      for (const t of tasks) {
        await prisma.task.upsert({
          where: { id: t.id },
          update: {
            title: t.title,
            description: t.description,
            priority: t.priority,
            status: t.status,
            startDate: t.startDate,
            dueDate: t.dueDate,
            assignedToId: t.assignedToId,
          },
          create: {
            id: t.id,
            title: t.title,
            description: t.description,
            priority: t.priority,
            status: t.status,
            startDate: t.startDate,
            dueDate: t.dueDate,
            assignedToId: t.assignedToId,
          },
        });
      }
    }

    console.log(
      'Seeding complete. Users created/updated:',
      createdUsers.map((u) => ({ id: u.id, email: u.email })),
    );
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

await main();

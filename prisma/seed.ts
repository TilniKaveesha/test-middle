import { PrismaClient, Gender, Stream, ExamStatus, Day } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ✅ Create Admin
  const admin = await prisma.admin.create({
    data: {
      id: 'admin-001',
      username: 'adminuser',
    },
  });

  // ✅ Create Subjects (Common + Stream-based)
  const maths = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      stream: Stream.MATHS,
    },
  });

  const bio = await prisma.subject.create({
    data: {
      name: 'Biology',
      stream: Stream.BIO,
    },
  });

  const physics = await prisma.subject.create({
    data: {
      name: 'Physics',
      stream: null, // Common subject
    },
  });

  const chemistry = await prisma.subject.create({
    data: {
      name: 'Chemistry',
      stream: null, // Common subject
    },
  });

  // ✅ Create Susers (Team Leaders)
  const suser1 = await prisma.suser.create({
    data: {
      NIC: 'suser-001',
      username: 'john_doe',
      FirstName: 'John',
      LastName: 'Doe',
      Email: 'john@example.com',
      Password: 'hashedpassword123',
      school: 'XYZ High School',
      PhoneNumber: '1234567890',
      Address: '123 Street, City',
      gender: Gender.MALE,
      stream: Stream.MATHS,
      CreatedAt: new Date(),
      subjects: {
        connect: [{ id: maths.id }, { id: physics.id }], // Assign subjects to the team leader
      },
    },
  });

  const suser2 = await prisma.suser.create({
    data: {
      NIC: 'suser-002',
      username: 'jane_smith',
      FirstName: 'Jane',
      LastName: 'Smith',
      Email: 'jane@example.com',
      Password: 'hashedpassword123',
      school: 'ABC High School',
      PhoneNumber: '9876543210',
      Address: '456 Avenue, City',
      gender: Gender.FEMALE,
      stream: Stream.BIO,
      CreatedAt: new Date(),
      subjects: {
        connect: [{ id: bio.id }, { id: physics.id }], // Assign subjects to the team leader
      },
    },
  });

  // ✅ Create Users (Team Members)
  const user1 = await prisma.user.create({
    data: {
      NIC: 'user-001',
      FirstName: 'Alice',
      LastName: 'Johnson',
      Email: 'alice@example.com',
      Password: 'hashedpassword456',
      PhoneNumber: '1122334455',
      Address: '789 Road, City',
      gender: Gender.FEMALE,
      CreatedAt: new Date(),
      suserID: suser1.NIC, // Associate with team leader
      stream: Stream.MATHS, // Inherit the stream
      subjects: {
        connect: [{ id: maths.id }, { id: physics.id }], // Inherit subjects from Suser
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      NIC: 'user-002',
      FirstName: 'Bob',
      LastName: 'Brown',
      Email: 'bob@example.com',
      Password: 'hashedpassword456',
      PhoneNumber: '2233445566',
      Address: '321 Lane, City',
      gender: Gender.MALE,
      CreatedAt: new Date(),
      suserID: suser2.NIC, // Associate with team leader
      stream: Stream.BIO, // Inherit the stream
      subjects: {
        connect: [{ id: bio.id }, { id: physics.id }], // Inherit subjects from Suser
      },
    },
  });

  // ✅ Create Exams
  const exam1 = await prisma.exam.create({
    data: {
      name: 'Math Final Exam',
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      Day: Day.Monday,
      subjectId: maths.id,
      adminId: admin.id,
      susers: {
        connect: [{ NIC: suser1.NIC }], // Link team leader
      },
      users: {
        connect: [{ NIC: user1.NIC }], // Link team member
      },
    },
  });

  const exam2 = await prisma.exam.create({
    data: {
      name: 'Bio Final Exam',
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      Day: Day.Tuesday,
      subjectId: bio.id,
      adminId: admin.id,
      susers: {
        connect: [{ NIC: suser2.NIC }], // Link team leader
      },
      users: {
        connect: [{ NIC: user2.NIC }], // Link team member
      },
    },
  });

  // ✅ Create Results
  await prisma.result.create({
    data: {
      score: 95,
      status: ExamStatus.PASS,
      examId: exam1.id,
      userId: user1.NIC,
    },
  });

  await prisma.result.create({
    data: {
      score: 80,
      status: ExamStatus.PASS,
      examId: exam2.id,
      userId: user2.NIC,
    },
  });

  console.log('✅ Seeding completed!');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

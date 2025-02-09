import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { email: "foo@example.com", name: "Foo" },
      { email: "bar@example.com", name: "Bar" }
    ]
  });

  await prisma.scooter.createMany({
    data: [
      { name: "Scooter A", serialNumber: "TWTP123", licensePlate: "ABC-123" },
      { name: "Scooter B", serialNumber: "TWTP124", licensePlate: "ABC-124" },
      { name: "Scooter C", serialNumber: "TWTP125", licensePlate: "ABC-125" }
    ]
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
